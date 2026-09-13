package com.kuro.reader;

import android.os.Bundle;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(FilePickerPlugin.class);
        super.onCreate(savedInstanceState);
        // 沉浸阅读：JS 侧（StatusBar.hide）隐藏状态栏后，顶部下滑只临时呼出（浮层展示、自动收回，不挤压布局）
        WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        insetsController.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }

    /**
     * Intercept WebView text selection ActionMode to remove Google Lens/Search/Share.
     * Only keep standard text actions: Copy, Select All, Paste, Cut.
     */
    @Override
    public void onActionModeStarted(ActionMode mode) {
        Menu menu = mode.getMenu();
        // Remove all non-essential items (Google Lens, Search, Share, etc.)
        for (int i = menu.size() - 1; i >= 0; i--) {
            MenuItem item = menu.getItem(i);
            int id = item.getItemId();
            if (id != android.R.id.copy &&
                id != android.R.id.selectAll &&
                id != android.R.id.paste &&
                id != android.R.id.cut) {
                menu.removeItem(id);
            }
        }
        super.onActionModeStarted(mode);
    }
}
