package com.kuro.reader;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;
import androidx.core.app.ServiceCompat;

/**
 * 知识库生成的前台保活服务。
 *
 * WebView JS（Capacitor 桥）在 App 退后台后继续执行生成逻辑（Capacitor onPause
 * 不暂停自家 WebView），本服务只负责一件事：让进程保持前台优先级——
 * Doze 不限流网络、系统不因内存压力回收进程，长任务真正「后台运行」。
 * 服务同时独家持有生成进度通知（start/update 原地刷新；finish 把终态通知
 * detach 在通知栏后退场，stop 静默清场）。
 *
 * onStartCommand 统一先 startForeground 再分派动作：startForegroundService
 * 的契约（每次 start 后必须 startForeground）对 UPDATE/FINISH/STOP 同样成立。
 */
public class GenerationKeepAliveService extends Service {

    static final String ACTION_START = "com.kuro.reader.generation.START";
    static final String ACTION_UPDATE = "com.kuro.reader.generation.UPDATE";
    static final String ACTION_FINISH = "com.kuro.reader.generation.FINISH";
    static final String ACTION_STOP = "com.kuro.reader.generation.STOP";
    static final String EXTRA_TITLE = "title";
    static final String EXTRA_BODY = "body";

    static final String CHANNEL_ID = "kuro-generation";
    static final String CHANNEL_NAME = "知识库生成";
    /** 常驻进度通知 id（与听书通知 id=1、终态通知 id 区分开） */
    static final int PROGRESS_NOTIFICATION_ID = 2001;
    /** 终态通知 id：finish 后留在通知栏供回看 */
    static final int FINISHED_NOTIFICATION_ID = 2002;

    /** 便捷意图构造：插件与服务自身共用 */
    static Intent intent(Context context, String action, String title, String body) {
        Intent intent = new Intent(context, GenerationKeepAliveService.class);
        intent.setAction(action);
        intent.putExtra(EXTRA_TITLE, title == null ? "" : title);
        intent.putExtra(EXTRA_BODY, body == null ? "" : body);
        return intent;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent != null ? intent.getAction() : ACTION_STOP;
        String title = intent != null ? intent.getStringExtra(EXTRA_TITLE) : "";
        String body = intent != null ? intent.getStringExtra(EXTRA_BODY) : "";
        if (action == null) action = ACTION_STOP;

        switch (action) {
            case ACTION_FINISH: {
                // 终态通知经 startForeground 满足契约，再 detach 留在通知栏、服务退场
                Notification finished = buildNotification(title, body, false);
                ServiceCompat.startForeground(this, PROGRESS_NOTIFICATION_ID, finished,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
                ServiceCompat.stopForeground(this, Service.STOP_FOREGROUND_DETACH);
                stopSelf();
                break;
            }
            case ACTION_STOP: {
                Notification silent = buildNotification(title, body, true);
                ServiceCompat.startForeground(this, PROGRESS_NOTIFICATION_ID, silent,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
                ServiceCompat.stopForeground(this, Service.STOP_FOREGROUND_REMOVE);
                stopSelf();
                break;
            }
            case ACTION_UPDATE:
            case ACTION_START:
            default: {
                Notification progress = buildNotification(title, body, true);
                ServiceCompat.startForeground(this, PROGRESS_NOTIFICATION_ID, progress,
                        ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
                break;
            }
        }
        // 进程被杀后任务由 JS 侧持久化队列在下次启动续跑，服务无需重建
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW);
        manager.createNotificationChannel(channel);
    }

    private Notification buildNotification(String title, String body, boolean ongoing) {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_knowledge)
                .setContentTitle(title == null || title.isEmpty() ? getString(R.string.app_name) : title)
                .setContentText(body == null ? "" : body)
                .setOngoing(ongoing)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .build();
    }
}
