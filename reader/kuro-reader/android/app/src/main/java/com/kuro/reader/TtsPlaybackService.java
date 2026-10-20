package com.kuro.reader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/**
 * 听书的前台保活服务（mediaPlayback 类型）。
 *
 * 根治「息屏后听书听着听着就停」：息屏后 Activity 不可见，无前台服务的进程被
 * 系统降级为 cached——系统语音引擎的音频播在 TTS 服务进程里，本进程没有任何
 * 感知信号，cached-app freezer 直接冻结进程，当前分块播完后 onDone 回调再也
 * 进不了 WebView，下一块永不调度；神经网络引擎的块间合成窗口同样断链。
 *
 * 本服务两件事：mediaPlayback 前台服务保持进程前台优先级（不冻结、Doze 不限流），
 * 独家持有 PARTIAL_WAKE_LOCK 保 CPU 不休眠（块间调度/合成持续执行）。常驻通知
 * id=1 沿用旧版 LocalNotifications 听书通知的槽位（无缝升级），文案由 JS 侧
 * 组装（书名/正在朗读·章节/暂停态），start/update 原地刷新，stop 撤场并放锁。
 *
 * onStartCommand 统一先 startForeground 再分派动作：startForegroundService 的
 * 契约（每次 start 后必须 startForeground）对 UPDATE/STOP 同样成立。
 */
public class TtsPlaybackService extends Service {

    static final String ACTION_START = "com.kuro.reader.tts.START";
    static final String ACTION_UPDATE = "com.kuro.reader.tts.UPDATE";
    static final String ACTION_STOP = "com.kuro.reader.tts.STOP";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";

    static final String CHANNEL_ID = "tts-playback";
    static final String CHANNEL_NAME = "听书播报";
    /** 与旧版 LocalNotifications 听书通知同 id：升级覆盖后旧条目被新通知顶替 */
    static final int NOTIFICATION_ID = 1;

    private PowerManager.WakeLock wakeLock;

    /** 便捷意图构造：插件与服务自身共用 */
    static Intent intent(Context context, String action, String title, String body) {
        Intent intent = new Intent(context, TtsPlaybackService.class);
        intent.setAction(action);
        intent.putExtra(EXTRA_TITLE, title == null ? "" : title);
        intent.putExtra(EXTRA_BODY, body == null ? "" : body);
        return intent;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel();
        acquireWakeLock();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : ACTION_STOP;
        String title = intent != null ? intent.getStringExtra(EXTRA_TITLE) : "";
        String body = intent != null ? intent.getStringExtra(EXTRA_BODY) : "";
        if (action == null) action = ACTION_STOP;

        switch (action) {
            case ACTION_STOP: {
                Notification silent = buildNotification(title, body);
                ServiceCompat.startForeground(this, NOTIFICATION_ID, silent,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                ServiceCompat.stopForeground(this, Service.STOP_FOREGROUND_REMOVE);
                stopSelf();
                break;
            }
            case ACTION_UPDATE:
            case ACTION_START:
            default: {
                Notification progress = buildNotification(title, body);
                ServiceCompat.startForeground(this, NOTIFICATION_ID, progress,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
                break;
            }
        }
        // 播报状态不跨进程存活：进程被杀后由用户重新起播，服务无需重建
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        releaseWakeLock();
        super.onDestroy();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // 任务被划走：听书上下文（WebView/JS）一并消亡，退出服务防止空壳持锁
        releaseWakeLock();
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    /** 块间调度依赖 WebView JS 线程被唤醒：CPU 不能随息屏休眠，播报全程持锁 */
    private void acquireWakeLock() {
        PowerManager manager = (PowerManager) getSystemService(POWER_SERVICE);
        if (manager == null) return;
        wakeLock = manager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "kuro:tts-playback");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire();
    }

    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) wakeLock.release();
        wakeLock = null;
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW);
        manager.createNotificationChannel(channel);
    }

    private Notification buildNotification(String title, String body) {
        Intent launch = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentIntent = null;
        if (launch != null) {
            contentIntent = PendingIntent.getActivity(this, 0, launch,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        }
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_tts)
                .setContentTitle(title == null || title.isEmpty() ? getString(R.string.app_name) : title)
                .setContentText(body == null ? "" : body)
                .setContentIntent(contentIntent)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .build();
    }
}
