import { registerPlugin } from '@capacitor/core';

import type { ContinueWidgetPayload, StatsWidgetPayload } from '@/services/widget/widgetPayload';

/**
 * 桌面小组件桥（Android 原生 WidgetBridgePlugin）：
 * JS 推送「继续阅读 / 阅读统计」数据落盘并渲染 RemoteViews；
 * 小组件点击回 App 的深链经 consumePendingRoute（冷启动积压）
 * 与 widgetRoute 事件（暖启动实时）两条通道送达。
 */
export interface WidgetBridgePlugin {
  updateContinueWidget(options: { payload: ContinueWidgetPayload }): Promise<void>;
  updateStatsWidget(options: { payload: StatsWidgetPayload }): Promise<void>;
  consumePendingRoute(): Promise<{ route: string }>;
  addListener(
    eventName: 'widgetRoute',
    listenerFunc: (data: { route: string }) => void
  ): Promise<{ remove: () => Promise<void> }>;
}

const webWidgetBridge: WidgetBridgePlugin = {
  async updateContinueWidget(): Promise<void> {
    // Web 无桌面小组件：空操作
  },
  async updateStatsWidget(): Promise<void> {
    // 同上
  },
  async consumePendingRoute(): Promise<{ route: string }> {
    return { route: '' };
  },
  async addListener(): Promise<{ remove: () => Promise<void> }> {
    return { remove: async () => undefined };
  },
};

export const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge', {
  web: webWidgetBridge,
});
