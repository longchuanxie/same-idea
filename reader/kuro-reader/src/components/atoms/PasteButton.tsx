import React, { useState } from 'react';

import { COPY } from '@/constants/copy';
import { readTextFromClipboard } from '@/utils/clipboard';
import { toast } from '@/utils/toast';

interface PasteButtonProps {
  /** 粘贴落地：用剪贴板文本整体替换字段值（凭据/地址类字段整值替换最可预期） */
  onPaste: (text: string) => void;
}

/**
 * 输入框行尾「粘贴」裸图标钮（.btn-icon 配方，绝对定位悬浮在框内右侧）。
 *
 * 直读剪贴板落值，不依赖各家 WebView/ROM 的长按选择菜单——
 * 浮动工具栏由 Chromium 自绘，菜单项与弹出时机都不可控，真机上
 * 粘贴入口时有时无；应用级按钮是唯一稳定通道。
 * 消费方：外层包 `relative`，输入框补 `pr-11` 让出按钮位。
 */
export const PasteButton: React.FC<PasteButtonProps> = ({ onPaste }) => {
  const [pasting, setPasting] = useState(false);

  const handlePaste = async () => {
    setPasting(true);
    try {
      const text = await readTextFromClipboard();
      if (!text.trim()) {
        toast(COPY.toast.clipboardEmpty);
        return;
      }
      onPaste(text);
    } finally {
      setPasting(false);
    }
  };

  return (
    <button
      type="button"
      className="btn-icon absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
      aria-label="粘贴"
      title="粘贴"
      onClick={() => void handlePaste()}
      disabled={pasting}
    >
      <span className="material-symbols-outlined text-[18px]">content_paste</span>
    </button>
  );
};
