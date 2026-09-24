import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type Importance } from '@capacitor/local-notifications';

import { GenerationKeepAlive } from '@/plugins/GenerationKeepAlivePlugin';

/**
 * 知识库生成的系统通道联动：通知栏进度 + 前台保活服务。
 *
 * Android 上通知由前台服务（GenerationKeepAliveService）独家持有——
 * 服务活着 = 进程前台 = Doze 不限网、后台不被杀，生成真正「后台运行」；
 * JS 侧只负责把状态同步给它。非 Android 原生端回落 local-notifications；
 * Web 平台全部空操作。
 */

const CHANNEL_ID = 'kuro-generation';
const CHANNEL_NAME = '知识库生成';
/** Importance 枚举值 1 = LOW（无声、无横幅，不打断阅读） */
const CHANNEL_IMPORTANCE_LOW: Importance = 1;
/** 非平台回落路径的常驻通知 id（Android 主路径由服务持有，不用此通道） */
const FALLBACK_NOTIFICATION_ID = 2;
/** schedule.at 取 1s 前的过去时间：走 notify() 立即上屏路径（同听书通知的做法） */
const IMMEDIATE_PAST_MS = 1000;
const PERMISSION_DENIED_NOTICE = '未授权通知权限，退出应用后通知栏将不显示生成进度';

/** 生成期间常驻通知/服务的驱动状态 */
export interface GenerationNotificationState {
  active: boolean;
  bookTitle: string;
  taskLabel: string;
  done: number;
  total: number;
  /** 排在该任务后面的任务数（>0 时提示还有排队） */
  pendingCount: number;
}

export interface GenerationNotificationContent {
  title: string;
  body: string;
}

/** 纯函数：状态 → 常驻进度文案。未激活返回 null（调用方据此撤除） */
export function buildGenerationNotificationContent(
  state: GenerationNotificationState
): GenerationNotificationContent | null {
  if (!state.active) return null;
  const book = state.bookTitle.trim() || '未命名书';
  const progress = state.total > 0 ? `${state.done}/${state.total} 段` : '准备中';
  const pending = state.pendingCount > 0 ? `，还有 ${state.pendingCount} 项排队` : '';
  return {
    title: `正在生成${state.taskLabel}`,
    body: `《${book}》· ${progress}${pending}`,
  };
}

/** 纯函数：终态 → 收尾文案（非常驻，留在通知栏供回看） */
export function buildGenerationFinishedContent(
  bookTitle: string,
  taskLabel: string,
  error?: string
): GenerationNotificationContent {
  const book = bookTitle.trim() || '未命名书';
  if (error) {
    return { title: `${taskLabel}生成失败`, body: `《${book}》· ${error}` };
  }
  return { title: `${taskLabel}已生成`, body: `《${book}》· 打开档案卡知识库查看` };
}

const isAndroidNative = (): boolean => Capacitor.getPlatform() === 'android';

let channelReady = false;
/** 本进程内前台保活服务是否已被拉起（决定 start/update 分流，防后台 startService 违规） */
let foregroundActive = false;

async function ensureChannel(): Promise<void> {
  if (channelReady) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: CHANNEL_NAME,
      importance: CHANNEL_IMPORTANCE_LOW,
    });
  } catch {
    // 渠道创建失败：回落默认渠道，通知仍可显示
  }
  channelReady = true;
}

async function postFallbackNotification(content: GenerationNotificationContent, ongoing: boolean): Promise<void> {
  await ensureChannel();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: FALLBACK_NOTIFICATION_ID,
        title: content.title,
        body: content.body,
        channelId: CHANNEL_ID,
        ongoing,
        autoCancel: !ongoing,
        isExactNotification: false,
        schedule: { at: new Date(Date.now() - IMMEDIATE_PAST_MS) },
      },
    ],
  });
}

/**
 * 把生成进度同步到系统通道（Android → 前台服务通知；其余原生 → local-notifications；
 * Web 空操作）。未激活时撤除常驻通知。任何失败静默吞掉——通知失败不阻断生成。
 */
export async function syncGenerationNotification(state: GenerationNotificationState): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const content = buildGenerationNotificationContent(state);
  try {
    if (isAndroidNative()) {
      if (!content) {
        if (foregroundActive) {
          await GenerationKeepAlive.stop();
          foregroundActive = false;
        }
        return;
      }
      // 队列活着就保持前台服务：首次 start 拉起（必须在前后台时机上安全——
      // 首次同步总是发生在用户动作或 App 启动时），此后 update 原地刷新通知
      if (foregroundActive) {
        await GenerationKeepAlive.update({ title: content.title, body: content.body });
      } else {
        await GenerationKeepAlive.start({ title: content.title, body: content.body });
        foregroundActive = true;
      }
      return;
    }
    if (!content) {
      await LocalNotifications.removeDeliveredNotificationsById({ ids: [FALLBACK_NOTIFICATION_ID] });
    } else {
      await postFallbackNotification(content, true);
    }
  } catch {
    // 通知/服务失败不影响生成本身
  }
}

/**
 * 任务终态收尾：非 Android 原生撤常驻并补一条可回看的完成/失败通知；
 * Android 上由服务完成同样的事（finish = 收尾通知 + 主动退前台）。
 */
export async function notifyGenerationFinished(
  bookTitle: string,
  taskLabel: string,
  error?: string
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  const content = buildGenerationFinishedContent(bookTitle, taskLabel, error);
  try {
    if (isAndroidNative()) {
      // 服务收尾：终态通知留在通知栏（detach），常驻进度条撤除，服务退场
      await GenerationKeepAlive.finish({ title: content.title, body: content.body });
      foregroundActive = false;
      return;
    }
    await LocalNotifications.removeDeliveredNotificationsById({ ids: [FALLBACK_NOTIFICATION_ID] });
    await postFallbackNotification(content, false);
  } catch {
    // 同上
  }
}

/** 队列空转：确保前台服务退出（Android）；其余平台无常驻可清 */
export async function stopGenerationForeground(): Promise<void> {
  if (!isAndroidNative() || !foregroundActive) return;
  try {
    await GenerationKeepAlive.stop();
  } catch {
    // 服务缺席（插件异常）不影响主流程
  }
  foregroundActive = false;
}

/**
 * 请求通知权限（Android 13+ 运行时权限）。首次发起生成时调用——上下文明确的时机
 * 弹系统对话框；被拒时经 onDeniedNotice 至多提示一次（进程级）。
 */
export async function requestGenerationNotificationPermission(
  onDeniedNotice?: (message: string) => void
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    let status = await LocalNotifications.checkPermissions();
    if (status.display === 'prompt' || status.display === 'prompt-with-rationale') {
      status = await LocalNotifications.requestPermissions();
    }
    if (status.display === 'granted') return true;
    onDeniedNotice?.(PERMISSION_DENIED_NOTICE);
    return false;
  } catch {
    return false;
  }
}

/** **仅供测试使用**，不应在生产代码中调用。 */
export function _resetGenerationNotificationForTesting(): void {
  channelReady = false;
  foregroundActive = false;
}
