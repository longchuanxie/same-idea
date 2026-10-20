import { LocalNotifications } from '@capacitor/local-notifications';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TtsPlaybackKeepAlive } from '@/plugins/TtsPlaybackKeepAlivePlugin';
import { isNativePlatform } from '@/utils/capacitor';

import {
  _resetTtsNotificationForTesting,
  buildTtsPlaybackNotificationContent,
  clearTtsPlaybackNotification,
  requestTtsPlaybackNotificationPermission,
  syncTtsPlaybackNotification,
} from './ttsNotification';

vi.mock('@/plugins/TtsPlaybackKeepAlivePlugin', () => ({
  TtsPlaybackKeepAlive: {
    start: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: vi.fn().mockResolvedValue(undefined),
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

const startMock = vi.mocked(TtsPlaybackKeepAlive.start);
const updateMock = vi.mocked(TtsPlaybackKeepAlive.update);
const stopMock = vi.mocked(TtsPlaybackKeepAlive.stop);
const removeDeliveredMock = vi.mocked(LocalNotifications.removeDeliveredNotificationsById);
const checkPermissionsMock = vi.mocked(LocalNotifications.checkPermissions);
const requestPermissionsMock = vi.mocked(LocalNotifications.requestPermissions);
const isNativeMock = vi.mocked(isNativePlatform);

beforeEach(() => {
  _resetTtsNotificationForTesting();
  vi.clearAllMocks();
  startMock.mockResolvedValue(undefined);
  updateMock.mockResolvedValue(undefined);
  stopMock.mockResolvedValue(undefined);
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
  it('Web 平台不触碰任何插件', async () => {
    isNativeMock.mockReturnValue(false);
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '第一章', paused: false });
    expect(startMock).not.toHaveBeenCalled();
    expect(stopMock).not.toHaveBeenCalled();
    expect(removeDeliveredMock).not.toHaveBeenCalled();
  });

  it('原生激活：先清旧通道残留再拉起前台服务（起播文案）', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });

    // 旧通知（v1.35 及之前 LocalNotifications id=1）必须先于服务 start 清掉：
    // 服务通知就位后撤同 id 会误伤前台服务通知
    expect(removeDeliveredMock).toHaveBeenCalledTimes(1);
    expect(removeDeliveredMock.mock.calls[0][0].ids).toEqual([1]);
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock.mock.calls[0][0]).toEqual({ title: '三体', body: '正在朗读 · 科学边界' });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('内容不变不重发（去抖闪烁）', async () => {
    const state = { active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false };
    await syncTtsPlaybackNotification(state);
    await syncTtsPlaybackNotification({ ...state });
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('暂停与换章原地更新（update 同槽位通知）', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: true });

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0]).toEqual({ title: '三体', body: '已暂停 · 台球' });
  });

  it('停止时撤服务，撤除后重复停止不重复调用', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });

    expect(stopMock).toHaveBeenCalledTimes(1);
  });

  it('快速连续同步收敛到最新状态：仅最新内容交付一次', async () => {
    // 第一次入队的 start 挂在手动闸门上：证明即便它完成得晚，也不会把旧状态盖回去
    let releaseSlowStart!: () => void;
    const slowGate = new Promise<void>((resolve) => { releaseSlowStart = resolve; });
    startMock.mockImplementationOnce(() => slowGate);
    const first = syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    const second = syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: false });
    releaseSlowStart();
    await first;
    await second;

    // 第二次入队执行时重读 desiredState（台球），与首次签名相同直接跳过：
    // 全程只交付一次，且是最新内容
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock.mock.calls[0][0].body).toBe('正在朗读 · 台球');
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('服务启动失败静默吞掉且不阻断后续更新', async () => {
    startMock.mockRejectedValueOnce(new Error('foreground service not allowed'));
    await expect(
      syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false })
    ).resolves.toBeUndefined();

    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: false });
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0].body).toBe('正在朗读 · 台球');
  });

  it('旧通道清理只在进程内首次起播发生一次', async () => {
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '台球', paused: false });

    expect(removeDeliveredMock).toHaveBeenCalledTimes(1);
    expect(startMock).toHaveBeenCalledTimes(2);
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
    startMock.mockClear();

    await expect(requestTtsPlaybackNotificationPermission()).resolves.toBe(true);
    expect(requestPermissionsMock).toHaveBeenCalledTimes(1);
    // Android 13+ 未授权时前台服务照常运行但通知被隐藏：授权后强制重发一次
    expect(startMock).toHaveBeenCalledTimes(1);
    expect(startMock.mock.calls[0][0].body).toBe('正在朗读 · 科学边界');
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
  it('无条件撤服务并清空期望状态（异常态下服务也必须撤场放锁）', async () => {
    await clearTtsPlaybackNotification();
    expect(stopMock).toHaveBeenCalledTimes(1);

    await syncTtsPlaybackNotification({ active: true, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    await clearTtsPlaybackNotification();
    expect(stopMock).toHaveBeenCalledTimes(2);

    // 清空后再 sync 未激活状态：不产生新的撤除或上屏
    await syncTtsPlaybackNotification({ active: false, bookTitle: '三体', chapterTitle: '科学边界', paused: false });
    expect(stopMock).toHaveBeenCalledTimes(2);
    expect(startMock).toHaveBeenCalledTimes(1);
  });

  it('Web 平台空操作', async () => {
    isNativeMock.mockReturnValue(false);
    await clearTtsPlaybackNotification();
    expect(stopMock).not.toHaveBeenCalled();
  });
});
