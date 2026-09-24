package com.kuro.reader;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    /** Chromium 浮动选择工具栏在 onActionModeStarted 之后才异步填充菜单项，延后再过滤一次 */
    private static final long MENU_POPULATE_DELAY_MS = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FilePickerPlugin.class);
        registerPlugin(TextFocusPlugin.class);
        registerPlugin(GenerationKeepAlivePlugin.class);
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
        // 沉浸阅读：JS 侧（StatusBar.hide）隐藏状态栏后，顶部下滑只临时呼出（浮层展示、自动收回，不挤压布局）
        WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        insetsController.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    /**
     * 小组件点击深链：BridgeActivity.load() 会用启动 Intent 回放本回调（冷启动），
     * 热启动由系统直接回调——两条路都把路由交给 WidgetBridgePlugin（落盘 + 通知 JS）。
     */
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        WidgetBridgePlugin.handleLaunchIntent(this, intent);
    }

    /**
     * Intercept WebView text selection ActionMode.
     * - TYPE_FLOATING（Chromium 浮动工具栏）按焦点信号分流（TextFocusPlugin）：
     *   - 焦点在文本输入框：这是表单的复制/剪切/粘贴/全选工具栏，放行——
     *     输入框与正文选区的浮动工具栏同为 TYPE_FLOATING，无差别 finish 会连根掐掉
     *     所有表单的长按复制（编辑档案等，真机实测复现）。
     *   - 其余视为阅读器正文选区工具栏（Copy/Share/Select all）：直接 finish——
     *     阅读器的划线/复制/批注动作条由 Web 层自绘，系统条与它叠屏；
     *     finish 只收菜单，不收选区，原生拖拽手柄保留（扩选依赖手柄）。
     * - 其余（主 ActionMode）沿用过滤：只留标准文本操作。
     */
    @Override
    public void onActionModeStarted(ActionMode mode) {
        if (mode.getType() == ActionMode.TYPE_FLOATING) {
            if (!TextFocusPlugin.isTextInputFocused()) {
                mode.finish();
            }
            super.onActionModeStarted(mode);
            return;
        }
        Menu menu = mode.getMenu();
        stripToTextActions(menu);
        new Handler(Looper.getMainLooper()).postDelayed(() -> stripToTextActions(menu), MENU_POPULATE_DELAY_MS);
        super.onActionModeStarted(mode);
    }

    private static void stripToTextActions(Menu menu) {
        for (int i = menu.size() - 1; i >= 0; i--) {
            MenuItem item = menu.getItem(i);
            int id = item.getItemId();
            if (id != android.R.id.copy &&
                id != android.R.id.selectAll &&
                id != android.R.id.paste &&
                id != android.R.id.pasteAsPlainText &&
                id != android.R.id.cut) {
                menu.removeItem(id);
            }
        }
    }
}
