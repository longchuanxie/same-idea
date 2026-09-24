package com.kuro.reader.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/**
 * 「阅读统计」桌面小组件：今日分钟数 + 目标进度 + 连续天数，点击进统计页。
 * 数据由 JS 侧（WidgetBridge.updateStatsWidget）在时长会话变化时推送；
 * onUpdate 兜底覆盖「被添加到桌面 / 设备重启」场景。
 */
public class ReadingStatsWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        KuroWidgets.renderStats(context, manager, appWidgetIds);
    }
}
