import { LocalNotifications, type ScheduleResult } from '@capacitor/local-notifications';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { isNativePlatform } from '@/utils/capacitor';

import {
  _resetTtsNotificationForTesting,
  buildTtsPlaybackNotificationContent,
  clearTtsPlaybackNotification,
  requestTtsPlaybackNotificationPermission,
  syncTtsPlaybackNotification,
} from './ttsNotification';

/** schedule 的成功决议值（本用例只关心调用参数，不消费返回结构） */
const SCHEDULE_OK = {} as ScheduleResult;

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    // 工厂被提升至文件顶，不能引用 SCHEDULE_OK（TDZ），内联等价字面量
    schedule: vi.fn().mockResolvedValue({} as ScheduleResult),
    cancel: vi.fn().mockResolvedValue(undefined),
    removeDeliveredNotificationsById: vi.fn().mockResolvedValue(undefined),
    createChannel: vi.fn().mockResolvedValue(undefined),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    requestPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  },
}));

vi.mock('@/utils/capacitor', () => ({
  isNativePlatform: vi.fn(() => true),
}));

const scheduleMock = vi.mocked(LocalNotifications.schedule);
const cancelMock = vi.mocked(LocalNotifications.cancel);
const removeDeliveredMock = vi.mocked(LocalNotifications.removeDeliveredNotificationsById);
const createChannelMock = vi.mocked(LocalNotifications.createChannel);
const checkPermissionsMock = vi.mocked(LocalNotifications.checkPermissions);
const requestPermissionsMock = vi.mocked(LocalNotifications.requestPermissions);
const isNativeMock = vi.mocked(isNativePlatform);

const notifiedNotifications = () =>
  scheduleMock.mock.calls.flatMap(([{ notifications }]) => notifications);

beforeEach(() => {
  _resetTtsNotificationForTesting();
  vi.clearAllMocks();
  scheduleMock.mockResolvedValue(SCHEDULE_OK);
  cancelMock.mockResolvedValue(undefined);
  checkPermissionsMock.mockResolvedValue({ display: 'granted' });
  requestPermissionsMock.mockResolvedValue({ display: 'granted' });
  isNativeMock.mockReturnValue(true);
});

describe('buildTtsPlaybackNotificationContent', () => {
  it('未激活返回 null', () => {
    expect(buildTtsPlaybackNotificationContent({ active: false, bookTitle: '三体', chapterTitle: '第一章', paused: false })).toBeNull();
  });

  it('激活时书名为题、状态+章节为正文', () => {
    expect(
      buildTtsPlaybackNotificationContent({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false })
    ).toEqual({ title: '三体', body: '正在朗读 · 科学边界' });
  });

  it('暂停态正文以「已暂停」开头', () => {
    expect(
      buildTtsPlaybackNotificationContent({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: true })
    ).toEqual({ title: '三体', body: '已暂停 · 科学边界' });
  });

  it('书名空白回落「听书」，章节空白仅剩状态', () => {
    expect(
      buildTtsPlaybackNotificationContent({ active: true, bookTitle: '  ', chapterTitle: ' ', paused: false })
    ).toEqual({ title: '听书', body: '正在朗读' });
  });
});

describe('syncTtsPlaybackNotification', () => {
  it('Web 平台不触碰插件', async () => {
    isNativeMock.mockReturnValue(false);
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '第一章', paused: false });
    expect(scheduleMock).not.toHaveBeenCalled();
    expect(createChannelMock).not.toHaveBeenCalled();
  });

  it('原生激活：先建低重要性渠道，再以常驻方式立即上屏', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });

    expect(createChannelMock).toHaveBeenCalledTimes(1);
    const channelArg = createChannelMock.mock.calls[0][0];
    expect(channelArg.id).toBe('tts-playback');
    expect(channelArg.importance).toBe(1);

    const [scheduled] = notifiedNotifications();
    expect(scheduled.id).toBe(1);
    expect(scheduled.title).toBe('三体');
    expect(scheduled.body).toBe('正在朗读 · 科学边界');
    expect(scheduled.ongoing).toBe(true);
    expect(scheduled.autoCancel).toBe(false);
    expect(scheduled.channelId).toBe('tts-playback');
    // 不声明精确闹钟：避免 Android 12+ 被「闹钟与提醒」设置页劫持挂起
    expect(scheduled.isExactNotification).toBe(false);
    // at 取过去时间：走 notify() 立即路径而非 AlarmManager
    const scheduledAt = scheduled.schedule?.at;
    expect(scheduledAt).toBeInstanceOf(Date);
    expect(scheduledAt?.getTime() ?? Number.POSITIVE_INFINITY).toBeLessThan(Date.now());
  });

  it('内容不变不重发（去抖闪烁）', async () => {
    const state = { active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false };
    await syncTtsPlaybackNotification(state);
    await syncTtsPlaybackNotification({ ...state });
    expect(scheduleMock).toHaveBeenCalledTimes(1);
  });

  it('暂停与换章原地更新同一 id', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: true });

    const all = notifiedNotifications();
    expect(all).toHaveLength(2);
    expect(new Set(all.map((n) => n.id))).toEqual(new Set([1]));
    expect(all[1].body).toBe('已暂停 · 台球');
  });

  it('停止时撤除通知，撤除后重复停止不重复调用', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });

    // 已上屏条目走 removeDeliveredNotificationsById（cancel 只作用于待定通知）
    expect(removeDeliveredMock).toHaveBeenCalledTimes(1);
    expect(removeDeliveredMock.mock.calls[0][0].ids).toEqual([1]);
    expect(cancelMock).not.toHaveBeenCalled();
  });

  it('快速连续同步收敛到最新状态：仅最新内容上屏一次', async () => {
    // 第一次入队的 schedule 挂在手动闸门上：证明即便它完成得晚，也不会把旧状态盖回去
    let releaseSlowSchedule!: () => void;
    const slowGate = new Promise<ScheduleResult>((resolve) => { releaseSlowSchedule = () => resolve(SCHEDULE_OK); });
    scheduleMock.mockImplementationOnce(() => slowGate);
    const first = syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    const second = syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: false });
    releaseSlowSchedule();
    await first;
    await second;

    const all = notifiedNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].body).toBe('正在朗读 · 台球');
  });

  it('上屏失败静默吞掉且不阻断后续重试', async () => {
    scheduleMock.mockRejectedValueOnce(new Error('no permission'));
    await expect(
      syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false })
    ).resolves.toBeUndefined();

    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: false });
    expect(scheduleMock).toHaveBeenCalledTimes(2);
    expect(notifiedNotifications()[1].body).toBe('正在朗读 · 台球');
  });
});

describe('requestTtsPlaybackNotificationPermission', () => {
  it('已授权直接返回 true，不打扰系统弹窗', async () => {
    checkPermissionsMock.mockResolvedValue({ display: 'granted' });
    await expect(requestTtsPlaybackNotificationPermission()).resolves.toBe(true);
    expect(requestPermissionsMock).not.toHaveBeenCalled();
  });

  it('prompt 态转系统弹窗；授权时朗读已在进行则补发通知', async () => {
    checkPermissionsMock.mockResolvedValue({ display: 'prompt' });
    requestPermissionsMock.mockResolvedValue({ display: 'granted' });
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    scheduleMock.mockClear();

    await expect(requestTtsPlaybackNotificationPermission()).resolves.toBe(true);
    expect(requestPermissionsMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock).toHaveBeenCalledTimes(1);
    expect(notifiedNotifications()[0].body).toBe('正在朗读 · 科学边界');
  });

  it('被拒时回调提示一次，之后再拒不再提示', async () => {
    checkPermissionsMock.mockResolvedValue({ display: 'prompt' });
    requestPermissionsMock.mockResolvedValue({ display: 'denied' });
    const onDeniedNotice = vi.fn();

    await expect(requestTtsPlaybackNotificationPermission(onDeniedNotice)).resolves.toBe(false);
    await expect(requestTtsPlaybackNotificationPermission(onDeniedNotice)).resolves.toBe(false);
    expect(onDeniedNotice).toHaveBeenCalledTimes(1);
    expect(onDeniedNotice.mock.calls[0][0]).toContain('通知');
  });
});

describe('clearTtsPlaybackNotification', () => {
  it('撤除已上屏通知并清空期望状态', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await clearTtsPlaybackNotification();
    expect(removeDeliveredMock).toHaveBeenCalledTimes(1);

    // 清空后再 sync 未激活状态：不产生新的撤除或上屏
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    expect(removeDeliveredMock).toHaveBeenCalledTimes(1);
    expect(scheduleMock).toHaveBeenCalledTimes(1);
  });

  it('Web 平台空操作', async () => {
    isNativeMock.mockReturnValue(false);
    await clearTtsPlaybackNotification();
    expect(removeDeliveredMock).not.toHaveBeenCalled();
  });
});
