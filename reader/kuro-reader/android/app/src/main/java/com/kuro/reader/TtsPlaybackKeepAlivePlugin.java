package com.kuro.reader;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * JS → 原生的听书前台保活入口（TtsPlaybackKeepAlive）。
 * start/update 拉起并刷新常驻播报通知，stop 撤场放锁。start 由用户在
 * 前台开启听书触发，满足 Android 12+ 前台服务启动限制；息屏后的
 * 自动续播只发 update（服务已在场），不触碰限制。
 */
@CapacitorPlugin(name = "TtsPlaybackKeepAlive")
public class TtsPlaybackKeepAlivePlugin extends Plugin {

    private void dispatch(String action, PluginCall call) {
        String title = call.getString("title", "");
        String body = call.getString("body", "");
        Context context = getContext().getApplicationContext();
        Intent intent = TtsPlaybackService.intent(context, action, title, body);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void start(PluginCall call) {
        dispatch(TtsPlaybackService.ACTION_START, call);
    }

    @PluginMethod
    public void update(PluginCall call) {
        dispatch(TtsPlaybackService.ACTION_UPDATE, call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        dispatch(TtsPlaybackService.ACTION_STOP, call);
    }
}
