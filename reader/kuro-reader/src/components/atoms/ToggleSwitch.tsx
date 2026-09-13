import React from 'react';

import { cn } from '@/utils/cn';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel?: string;
}

/** 「墨·纸·光·印」体系的开关：形守胶囊（开关形态是全平台肌肉记忆，不改形），
 *  色走体系——开启 = 朱砂轨道（钤印，seal 为激活态唯一强调色），关闭 = 纸灰槽；
 *  圆钮用浮纸色替代通用纯白塑料钮。 */
export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, ariaLabel }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={ariaLabel}
    className={cn(
      'relative inline-block w-11 h-6 rounded-full toggle-spring shrink-0',
      checked ? 'bg-seal' : 'bg-surface-container-highest'
    )}
    onClick={() => onChange(!checked)}
  >
    <span
      aria-hidden="true"
      className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 bg-surface-bright rounded-full toggle-thumb-spring border',
        checked ? 'translate-x-5 border-seal-deep' : 'border-outline-variant'
      )}
    />
  </button>
);
