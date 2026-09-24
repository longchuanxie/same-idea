package com.kuro.reader;

import android.content.Context;
import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.kuro.reader.widget.KuroWidgets;
import com.kuro.reader.widget.WidgetDataStore;

import java.util.concurrent.atomic.AtomicReference;

/**
 * JS → 小组件的数据桥（WidgetBridge）。
 * - updateContinueWidget / updateStatsWidget：载荷落盘 + 立即渲染全部实例
 * - consumePendingRoute：取走冷启动期间积压的小组件深链（JS 就绪前点击不丢）
 * - widgetRoute 事件：暖启动时点击小组件，路由经此实时推给 JS 侧导航
 * MainActivity 的 onCreate/onNewIntent 统一走 handleLaunchIntent。
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    public static final String EXTRA_ROUTE = "kuro_widget_route";
    public static final String ACTION_WIDGET_OPEN = "com.kuro.reader.widget.OPEN.";
    private static final String EVENT_ROUTE = "widgetRoute";

    private static final AtomicReference<WidgetBridgePlugin> INSTANCE = new AtomicReference<>();

    @Override
    public void load() {
        INSTANCE.set(this);
    }

    @Override
    protected void handleOnDestroy() {
        INSTANCE.compareAndSet(this, null);
    }

    @PluginMethod
    public void updateContinueWidget(PluginCall call) {
        JSObject data = call.getData();
        // JS 侧以 {payload:{...}} 包裹：解开包装再落盘（无包装时兼容直传）
        JSObject payload = data.has("payload") ? data.getJSObject("payload") : data;
        if (payload == null) {
            call.reject("payload missing");
            return;
        }
        String coverBase64 = payload.optString("coverBase64", "");
        if (!coverBase64.isEmpty()) {
            WidgetDataStore.saveCover(getContext(), payload.optString("bookId", ""), coverBase64);
        }
        payload.remove("coverBase64");
        WidgetDataStore.putPayload(getContext(), WidgetDataStore.KEY_CONTINUE, payload);
        KuroWidgets.renderContinue(getContext());
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void updateStatsWidget(PluginCall call) {
        JSObject data = call.getData();
        JSObject payload = data.has("payload") ? data.getJSObject("payload") : data;
        if (payload == null) {
            call.reject("payload missing");
            return;
        }
        WidgetDataStore.putPayload(getContext(), WidgetDataStore.KEY_STATS, payload);
        KuroWidgets.renderStats(getContext());
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void consumePendingRoute(PluginCall call) {
        String route = WidgetDataStore.takePendingRoute(getContext());
        JSObject result = new JSObject();
        result.put("route", route == null ? "" : route);
        call.resolve(result);
    }

    /** MainActivity 的冷启动（load 回放 getIntent）与暖启动（onNewIntent）统一入口 */
    public static void handleLaunchIntent(Context context, Intent intent) {
        String route = intent != null ? intent.getStringExtra(EXTRA_ROUTE) : null;
        if (route == null || route.isEmpty()) return;
        WidgetDataStore.putPendingRoute(context.getApplicationContext(), route);
        WidgetBridgePlugin plugin = INSTANCE.get();
        if (plugin != null) {
            JSObject event = new JSObject();
            event.put("route", route);
            plugin.notifyListeners(EVENT_ROUTE, event);
        }
    }
}
