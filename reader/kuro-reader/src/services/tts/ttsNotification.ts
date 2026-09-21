import { LocalNotifications, type Importance } from '@capacitor/local-notifications';

import { isNativePlatform } from '@/utils/capacitor';

/** 常驻播报通知复用同一 id：重发即原地更新（书名/章节/暂停态变化不产生新条目） */
const TTS_NOTIFICATION_ID = 1;
/** Android 通知渠道：低重要性（无声、无横幅、不打断朗读本身） */
const TTS_CHANNEL_ID = 'tts-playback';
const TTS_CHANNEL_NAME = '听书播报';
/** Importance 枚举值 1 = LOW（definitions 里是字面量联合类型，具名常量防魔数） */
const CHANNEL_IMPORTANCE_LOW: Importance = 1;
/** schedule.at 取 1s 前的过去时间：走插件 notify() 立即上屏路径，不经 AlarmManager
 *  （避开 Doze/精确闹钟权限，且保证切后台后仍即时可见） */
const IMMEDIATE_PAST_MS = 1000;
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

/** 纯函数：状态 → 通知文案。未激活返回 null（调用方据此撤通知） */
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
/** 渠道只建一次 */
let channelReady = false;
/** 权限被拒提示是否已发过（进程级一次） */
let permissionDeniedNotified = false;
/** 串行队列：同一通知 id 的 post/cancel 必须严格按提交顺序落地，
 *  乱序完成会让旧状态覆盖新状态（如快速暂停→换章） */
let queue: Promise<void> = Promise.resolve();

const contentSignature = (content: TtsNotificationContent): string => `${content.title}\u0000${content.body}`;

function enqueue(operation: () => Promise<void>): Promise<void> {
  const run = queue.then(operation, operation);
  queue = run.catch(() => undefined);
  return run;
}

/** Android 8+ 需通知渠道；低重要性渠道无声不打断，Web/旧系统缺席时静默跳过 */
async function ensureChannel(): Promise<void> {
  if (channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: TTS_CHANNEL_ID,
      name: TTS_CHANNEL_NAME,
      importance: CHANNEL_IMPORTANCE_LOW,
    });
  } catch {
    // 渠道创建失败（平台不支持/已存在配置差异）：回落默认渠道，通知仍可显示
  }
  channelReady = true;
}

/** 队列里的单次同步：以 desiredState 当前值为准落地 */
async function applyDesiredState(): Promise<void> {
  const state = desiredState;
  const content = state ? buildTtsPlaybackNotificationContent(state) : null;
  if (!content) {
    if (postedSignature === null) return;
    try {
      await LocalNotifications.removeDeliveredNotificationsById({ ids: [TTS_NOTIFICATION_ID] });
    } catch {
      // 撤除失败（通知已不在/插件异常）：置空签名，后续状态变化会重发兜底
    }
    postedSignature = null;
    return;
  }
  if (postedSignature === contentSignature(content)) return;
  await ensureChannel();
  try {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: TTS_NOTIFICATION_ID,
          title: content.title,
          body: content.body,
          channelId: TTS_CHANNEL_ID,
          // 常驻条目：播放期间不可左滑清除，停止播报时由撤除路径显式清除
          ongoing: true,
          autoCancel: false,
          // at 为过去时间走 notify() 立即上屏，本就不经 AlarmManager；
          // 显式关掉精确闹钟语义，否则插件默认 isExactNotification=true，
          // Android 12+ 无特殊授权时会拉起系统「闹钟与提醒」设置页并挂起本次调用
          isExactNotification: false,
          schedule: { at: new Date(Date.now() - IMMEDIATE_PAST_MS) },
        },
      ],
    });
    postedSignature = contentSignature(content);
  } catch {
    // 上屏失败（未授权/插件异常）：签名保持 null，授权成功或状态变化后重试
  }
}

/**
 * 把听书状态同步到系统通知栏（仅原生平台生效，Web 直接返回）。
 * - 激活：常驻显示「书名 / 正在朗读 · 章节」，暂停态与换章时原地更新
 * - 停止：撤除通知（removeDeliveredNotificationsById——v8.3.1 的 cancel 只撤
 *   「待定」通知，对已上屏条目仅改存储标记，通知栏不会有任何变化）
 * - 快速连续调用经串行队列收敛到最新状态，任何异常静默吞掉（通知失败不阻断朗读）
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
        // 授权前的 notify 会被系统静默吞掉（promise 却正常 resolve，签名被误置）：
        // 清空签名强制重发，弹窗晚于起播也能立即就位
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

/** 显式撤除常驻通知（退出阅读器/停止听书时调用；Web 平台空操作） */
export async function clearTtsPlaybackNotification(): Promise<void> {
  if (!isNativePlatform()) return;
  desiredState = null;
  await enqueue(async () => {
    if (postedSignature === null) return;
    try {
      await LocalNotifications.removeDeliveredNotificationsById({ ids: [TTS_NOTIFICATION_ID] });
    } catch {
      // 同上：撤除失败也置空签名走重发兜底
    }
    postedSignature = null;
  });
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetTtsNotificationForTesting(): void {
  desiredState = null;
  postedSignature = null;
  channelReady = false;
  permissionDeniedNotified = false;
  queue = Promise.resolve();
}
