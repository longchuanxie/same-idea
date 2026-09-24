package com.kuro.reader.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.view.View;
import android.widget.RemoteViews;

import com.kuro.reader.MainActivity;
import com.kuro.reader.R;
import com.kuro.reader.WidgetBridgePlugin;

import org.json.JSONObject;

/**
 * 两个小组件的 RemoteViews 渲染器。数据缺失时渲染指路空态
 * （「打开一本书，从这里继续」），首次添加/重启后无 App 介入也体面。
 */
public final class KuroWidgets {

    private KuroWidgets() {
    }

    public static void renderContinue(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, ContinueReadingWidgetProvider.class));
        renderContinue(context, manager, ids);
    }

    public static void renderContinue(Context context, AppWidgetManager manager, int[] ids) {
        JSONObject data = WidgetDataStore.getPayload(context, WidgetDataStore.KEY_CONTINUE);
        for (int appWidgetId : ids) {
            RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_continue_reading);
            if (data != null && !data.optString("bookId", "").isEmpty()) {
                String bookId = data.optString("bookId", "");
                String title = data.optString("bookTitle", "");
                String chapter = data.optString("chapterTitle", "");
                int percent = clampPercent(data.optInt("percent", 0));
                String route = data.optString("route", "");

                rv.setTextViewText(R.id.widget_book_title, title.isEmpty() ? context.getString(R.string.app_name) : title);
                rv.setTextViewText(R.id.widget_chapter, chapter);
                rv.setTextViewText(R.id.widget_percent, percent + "%");
                setProgressBar(rv, R.id.widget_progress, percent);
                rv.setViewVisibility(R.id.widget_cover, View.VISIBLE);
                Bitmap cover = WidgetDataStore.loadCover(context, bookId);
                if (cover != null) {
                    rv.setImageViewBitmap(R.id.widget_cover, cover);
                } else {
                    rv.setImageViewResource(R.id.widget_cover, R.drawable.widget_cover_placeholder);
                }
                if (!route.isEmpty()) {
                    rv.setOnClickPendingIntent(R.id.widget_continue_root, routePendingIntent(context, appWidgetId, route));
                }
            } else {
                rv.setTextViewText(R.id.widget_book_title, "打开一本书，从这里继续");
                rv.setTextViewText(R.id.widget_chapter, "");
                rv.setTextViewText(R.id.widget_percent, "");
                setProgressBar(rv, R.id.widget_progress, 0);
                rv.setViewVisibility(R.id.widget_cover, View.GONE);
                rv.setOnClickPendingIntent(R.id.widget_continue_root, routePendingIntent(context, appWidgetId, "/"));
            }
            manager.updateAppWidget(appWidgetId, rv);
        }
    }

    public static void renderStats(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, ReadingStatsWidgetProvider.class));
        renderStats(context, manager, ids);
    }

    public static void renderStats(Context context, AppWidgetManager manager, int[] ids) {
        JSONObject data = WidgetDataStore.getPayload(context, WidgetDataStore.KEY_STATS);
        int todayMinutes = data == null ? 0 : Math.max(0, data.optInt("todayMinutes", 0));
        int goalMinutes = data == null ? 0 : Math.max(0, data.optInt("goalMinutes", 0));
        int streakDays = data == null ? 0 : Math.max(0, data.optInt("streakDays", 0));
        int goalPercent = goalMinutes > 0 ? clampPercent(Math.round(todayMinutes * 100f / goalMinutes)) : 0;

        for (int appWidgetId : ids) {
            RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_stats);
            rv.setTextViewText(R.id.widget_today_minutes, String.valueOf(todayMinutes));
            rv.setTextViewText(R.id.widget_streak, streakDays > 0 ? "连续 " + streakDays + " 天" : "今天还没读");
            setProgressBar(rv, R.id.widget_goal_progress, goalPercent);
            rv.setTextViewText(R.id.widget_goal_label,
                    goalMinutes > 0 ? "目标 " + goalMinutes + " 分钟 · " + goalPercent + "%" : "到设置里定个每日目标");
            rv.setOnClickPendingIntent(R.id.widget_stats_root, routePendingIntent(context, appWidgetId, "/stats"));
            manager.updateAppWidget(appWidgetId, rv);
        }
    }

    private static int clampPercent(int percent) {
        return Math.max(0, Math.min(100, percent));
    }

    /** ProgressBar 赋值走 setInt 反射（RemoteViews.setProgress 三参版是 API 31+ 才有） */
    private static void setProgressBar(RemoteViews rv, int viewId, int percent) {
        rv.setInt(viewId, "setMax", 100);
        rv.setInt(viewId, "setProgress", clampPercent(percent));
    }

    /** 点击小组件 → 拉起主 Activity 携带路由；每实例独立 requestCode/action 防意图合并 */
    private static PendingIntent routePendingIntent(Context context, int appWidgetId, String route) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(WidgetBridgePlugin.ACTION_WIDGET_OPEN + appWidgetId);
        intent.putExtra(WidgetBridgePlugin.EXTRA_ROUTE, route);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(context, appWidgetId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
