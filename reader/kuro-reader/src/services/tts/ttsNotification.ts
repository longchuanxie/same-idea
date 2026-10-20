import { LocalNotifications } from '@capacitor/local-notifications';

import { TtsPlaybackKeepAlive } from '@/plugins/TtsPlaybackKeepAlivePlugin';
import { isNativePlatform } from '@/utils/capacitor';

/** 前台服务常驻播报通知槽位（与 v1.35 及之前 LocalNotifications 通知同 id，升级无缝顶替） */
const TTS_NOTIFICATION_ID = 1;
/** 权限被拒后的提示文案（每次进程生命周期至多提示一次，避免反复打扰） */
const PERMISSION_DENIED_NOTICE = '未授权通知权限，退出应用后通知栏将不显示听书状态';

/** 听书通知的驱动状态（TextReader 侧由 ttsActive/章节/暂停态组装） */
export interface TtsPlaybackNotificationState {
  active: boolean;
  bookTitle: string;
  chapterTitle: string;
  paused: boolean;
}

export interface TtsNotificationContent {
  title: string;
  body: string;
}

/** 纯函数：状态 → 通知文案。未激活返回 null（调用方据此撤服务） */
export function buildTtsPlaybackNotificationContent(
  state: TtsPlaybackNotificationState
): TtsNotificationContent | null {
  if (!state.active) return null;
  const title = state.bookTitle.trim() || '听书';
  const chapter = state.chapterTitle.trim();
  const status = state.paused ? '已暂停' : '正在朗读';
  return { title, body: chapter ? `${status} · ${chapter}` : status };
}

/** 最近一次期望状态：队列执行时重读，快速连续 sync 只落最新一次 */
let desiredState: TtsPlaybackNotificationState | null = null;
/** 已上屏文案签名：内容未变时跳过重发，避免无关渲染轮次制造通知闪烁 */
let postedSignature: string | null = null;
/** 旧通知通道（v1.35 及之前 LocalNotifications）的残留清理是否已做过 */
let legacyChannelSwept = false;
/** 权限被拒提示是否已发过（进程级一次） */
let permissionDeniedNotified = false;
/** 串行队列：start/update/stop 必须严格按提交顺序落地（乱序完成会让
 *  旧状态覆盖新状态，或让撤场先于上屏发生） */
let queue: Promise<void> = Promise.resolve();

const contentSignature = (content: TtsNotificationContent): string => `${content.title}\u0000${content.body}`;

function enqueue(operation: () => Promise<void>): Promise<void> {
  const run = queue.then(operation, operation);
  queue = run.catch(() => undefined);
  return run;
}

/**
 * 清掉 v1.35 及之前经 LocalNotifications 上屏的旧听书通知（id=1 同槽位）。
 * 只在起播（postedSignature 为 null）时执行，且必须先于服务 start——
 * 服务通知就位后再撤 id=1 会把前台服务通知一并撤掉。
 */
async function sweepLegacyNotificationOnce(): Promise<void> {
  if (legacyChannelSwept) return;
  legacyChannelSwept = true;
  try {
    await LocalNotifications.removeDeliveredNotificationsById({ ids: [TTS_NOTIFICATION_ID] });
  } catch {
    // 旧通知不存在/插件异常：清不到也无妨
  }
}

/** 队列里的单次同步：以 desiredState 当前值为准落地 */
async function applyDesiredState(): Promise<void> {
  const state = desiredState;
  const content = state ? buildTtsPlaybackNotificationContent(state) : null;
  if (!content) {
    if (postedSignature === null) return;
    postedSignature = null;
    try {
      await TtsPlaybackKeepAlive.stop();
    } catch {
      // 撤场失败（插件异常）：签名已置空，后续状态变化会重发兜底
    }
    return;
  }
  if (postedSignature === contentSignature(content)) return;
  const starting = postedSignature === null;
  postedSignature = contentSignature(content);
  try {
    if (starting) {
      await sweepLegacyNotificationOnce();
      await TtsPlaybackKeepAlive.start(content);
    } else {
      await TtsPlaybackKeepAlive.update(content);
    }
  } catch {
    // 上屏/服务启动失败（未授权前台服务/插件异常）：签名保持已置——语义上
    // 「最新状态已交付」，失败不回滚；授权或状态变化后重发兜底
  }
}

/**
 * 把听书状态同步到通知栏（仅原生平台生效，Web 直接返回）。
 * - 激活：拉起 mediaPlayback 前台服务——常驻显示「书名 / 正在朗读 · 章节」，
 *   进程不被息屏降级冻结、CPU 不休眠（根治息屏后播报中断），暂停态与换章时原地更新
 * - 停止：撤服务与通知（stopForeground REMOVE，wakelock 一并释放）
 * - 快速连续调用经串行队列收敛到最新状态，任何异常静默吞掉（保活失败不阻断朗读）
 */
export async function syncTtsPlaybackNotification(state: TtsPlaybackNotificationState): Promise<void> {
  if (!isNativePlatform()) return;
  desiredState = state;
  await enqueue(applyDesiredState);
}

/**
 * 请求通知权限（Android 13+ 运行时权限）。在用户开启听书时调用——上下文明确的时机
 * 弹系统对话框。授权成功时若朗读已在进行（弹窗期间已起播），立即补发常驻通知。
 * 返回是否已授权；被拒时经 onDeniedNotice 至多提示一次（进程级）。
 */
export async function requestTtsPlaybackNotificationPermission(
  onDeniedNotice?: (message: string) => void
): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    let status = await LocalNotifications.checkPermissions();
    if (status.display === 'prompt' || status.display === 'prompt-with-rationale') {
      status = await LocalNotifications.requestPermissions();
    }
    if (status.display === 'granted') {
      if (desiredState && buildTtsPlaybackNotificationContent(desiredState)) {
        // Android 13+ 未授权时前台服务照常运行但通知被系统隐藏：清空签名
        // 强制重发，授权晚于起播也能让通知立即就位
        postedSignature = null;
        await enqueue(applyDesiredState);
      }
      return true;
    }
    if (!permissionDeniedNotified) {
      permissionDeniedNotified = true;
      onDeniedNotice?.(PERMISSION_DENIED_NOTICE);
    }
    return false;
  } catch {
    return false;
  }
}

/** 显式撤除服务与通知（退出阅读器/停止听书时调用；Web 平台空操作）。
 *  无条件 stop：服务可能在签名丢失的异常态下仍活着，退出必须撤场放锁 */
export async function clearTtsPlaybackNotification(): Promise<void> {
  if (!isNativePlatform()) return;
  desiredState = null;
  await enqueue(async () => {
    postedSignature = null;
    try {
      await TtsPlaybackKeepAlive.stop();
    } catch {
      // 同上：撤场失败也置空签名走重发兜底
    }
  });
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetTtsNotificationForTesting(): void {
  desiredState = null;
  postedSignature = null;
  legacyChannelSwept = false;
  permissionDeniedNotified = false;
  queue = Promise.resolve();
}
