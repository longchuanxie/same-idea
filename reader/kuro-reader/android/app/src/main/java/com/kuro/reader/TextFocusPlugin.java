package com.kuro.reader;

import java.util.concurrent.atomic.AtomicBoolean;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * JS → 原生的「焦点在文本输入框」信号。
 * Android WebView 的输入框长按工具栏与正文选区工具栏同为 TYPE_FLOATING，
 * 原生无从区分；MainActivity 依赖本信号决定放行还是 finish：
 * 焦点在输入框（编辑档案/批注等）时放行系统复制/粘贴工具栏，
 * 否则视为阅读器正文选区工具栏，维持 Web 层自绘动作条的抑制策略。
 */
@CapacitorPlugin(name = "TextFocus")
public class TextFocusPlugin extends Plugin {

    /** 静态而非实例字段：onActionModeStarted 在 Activity 上回调，需跨插件实例读取；
     *  默认 false = 维持原有的全局抑制，JS 未上报时行为不回退 */
    private static final AtomicBoolean TEXT_INPUT_FOCUSED = new AtomicBoolean(false);

    public static boolean isTextInputFocused() {
        return TEXT_INPUT_FOCUSED.get();
    }

    @PluginMethod
    public void setFocused(PluginCall call) {
        Boolean focused = call.getBoolean("focused", false);
        TEXT_INPUT_FOCUSED.set(focused != null && focused);
        call.resolve(new JSObject());
    }
}
