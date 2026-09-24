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
 * JS → 原生的生成前台保活入口（GenerationKeepAlive）。
 * 全部动作经由服务 Intent 分派：start/update 拉起并刷新常驻进度通知，
 * finish 留一条终态通知后退场，stop 静默清场。调用方为前台 JS（用户动作
 * 或 App 启动续跑），满足 Android 12+ 前台服务启动限制。
 */
@CapacitorPlugin(name = "GenerationKeepAlive")
public class GenerationKeepAlivePlugin extends Plugin {

    private void dispatch(String action, PluginCall call) {
        String title = call.getString("title", "");
        String body = call.getString("body", "");
        Context context = getContext().getApplicationContext();
        Intent intent = GenerationKeepAliveService.intent(context, action, title, body);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void start(PluginCall call) {
        dispatch(GenerationKeepAliveService.ACTION_START, call);
    }

    @PluginMethod
    public void update(PluginCall call) {
        dispatch(GenerationKeepAliveService.ACTION_UPDATE, call);
    }

    @PluginMethod
    public void finish(PluginCall call) {
        dispatch(GenerationKeepAliveService.ACTION_FINISH, call);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        dispatch(GenerationKeepAliveService.ACTION_STOP, call);
    }
}
