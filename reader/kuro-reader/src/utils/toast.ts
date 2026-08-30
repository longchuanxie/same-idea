/** 轻量 Toast 的事件通道（组件 @/components/atoms/Toast 消费）。
 *  拆出 utils 以保持组件文件仅导出组件（react-refresh）。 */
export const TOAST_EVENT = 'kuro-toast';

export const DEFAULT_TOAST_DURATION_MS = 2600;

export interface ToastAction {
  label: string;
  onAction: () => void;
}

export interface ToastPayload {
  message: string;
  durationMs: number;
  action?: ToastAction;
}

export interface ToastOptions {
  durationMs?: number;
  /** 可选动作（如「撤销」），点击后 Toast 消失并执行 */
  action?: ToastAction;
}

/** 任意处调用 toast('已入藏') 或 toast('已移出座位', { action: { label: '撤销', onAction } }) */
export function toast(message: string, options: ToastOptions = {}): void {
  window.dispatchEvent(
    new CustomEvent<ToastPayload>(TOAST_EVENT, {
      detail: {
        message,
        durationMs: options.durationMs ?? DEFAULT_TOAST_DURATION_MS,
        action: options.action,
      },
    })
  );
}
