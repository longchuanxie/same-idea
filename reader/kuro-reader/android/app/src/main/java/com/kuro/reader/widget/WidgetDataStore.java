package com.kuro.reader.widget;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;

/**
 * 小组件的数据落点：JS 侧推送的最新载荷存 SharedPreferences，
 * AppWidget 在「被添加到桌面 / 设备重启 / onUpdate」时据此即时渲染，
 * 无需拉起 App。封面按书落盘为小图（96px JPEG），SharedPreferences 只存路径。
 */
public final class WidgetDataStore {

    private static final String PREFS_NAME = "kuro_widgets";
    public static final String KEY_CONTINUE = "continue_payload";
    public static final String KEY_STATS = "stats_payload";
    private static final String KEY_PENDING_ROUTE = "pending_widget_route";
    private static final String KEY_COVER_PATH_PREFIX = "cover_path_";

    private WidgetDataStore() {
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static JSONObject getPayload(Context context, String key) {
        try {
            String raw = prefs(context).getString(key, null);
            return raw == null ? null : new JSONObject(raw);
        } catch (Exception e) {
            return null;
        }
    }

    public static void putPayload(Context context, String key, JSONObject payload) {
        prefs(context).edit().putString(key, payload.toString()).apply();
    }

    /** 封面写入应用私有目录（JPEG 96px），返回落盘路径；失败返回 null（小组件显示占位） */
    public static String saveCover(Context context, String bookId, String base64) {
        try {
            byte[] bytes = android.util.Base64.decode(base64, android.util.Base64.DEFAULT);
            File file = new File(context.getFilesDir(), "widget_cover_" + bookId + ".jpg");
            FileOutputStream out = new FileOutputStream(file);
            out.write(bytes);
            out.close();
            prefs(context).edit().putString(KEY_COVER_PATH_PREFIX + bookId, file.getAbsolutePath()).apply();
            return file.getAbsolutePath();
        } catch (Exception e) {
            return null;
        }
    }

    public static Bitmap loadCover(Context context, String bookId) {
        String path = prefs(context).getString(KEY_COVER_PATH_PREFIX + bookId, null);
        if (path == null) return null;
        return BitmapFactory.decodeFile(path);
    }

    /** 深链路由先落盘再分发：JS 侧就绪前点击小组件（冷启动）也不丢 */
    public static void putPendingRoute(Context context, String route) {
        prefs(context).edit().putString(KEY_PENDING_ROUTE, route).apply();
    }

    /** 取走待处理路由（取后即清）；无则返回 null */
    public static String takePendingRoute(Context context) {
        SharedPreferences preferences = prefs(context);
        String route = preferences.getString(KEY_PENDING_ROUTE, null);
        if (route != null) {
            preferences.edit().remove(KEY_PENDING_ROUTE).apply();
        }
        return route;
    }
}
