import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';

/**
 * 统一复制出口，返回是否成功。
 *
 * 原生端优先走 Clipboard 插件：Android WebView 里 navigator.clipboard 常因
 * WebView 文档未获焦点抛 NotAllowedError，而异步等待后的 execCommand 兜底
 * 又会耗尽瞬时用户激活，双路皆败——表现为"全局复制不可用"。
 * 原生插件不依赖手势与焦点，是可靠通道；Web 端保持 clipboard API + execCommand 兜底。
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Clipboard.write({ string: text });
      return true;
    } catch {
      // 原生失败时继续尝试 Web 通道
    }
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 落到 execCommand 兜底
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}
