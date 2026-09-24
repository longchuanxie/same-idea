package com.kuro.reader.widget;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;

/**
 * 「继续阅读」桌面小组件：最近在读的书 + 章节与进度，点击回到上次位置。
 * 数据由 JS 侧（WidgetBridge.updateContinueWidget）在进度变化时推送渲染；
 * onUpdate 兜底覆盖「被添加到桌面 / 设备重启」场景（读 WidgetDataStore 落盘数据）。
 */
public class ContinueReadingWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        KuroWidgets.renderContinue(context, manager, appWidgetIds);
    }
}
