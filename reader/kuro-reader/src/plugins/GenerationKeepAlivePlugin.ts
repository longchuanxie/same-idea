import { registerPlugin } from '@capacitor/core';

export interface GenerationForegroundContent {
  title: string;
  body: string;
}

/**
 * 知识库生成的前台保活（Android）：
 * - start/update：前台服务持有常驻通知，进程不被 Doze 限网/回收，WebView JS 继续跑生成
 * - finish：补一条可回看的终态通知后服务主动退场
 * Web/iOS 无此插件（registerPlugin 回退未实现桥），调用方须自行 catch。
 */
export interface GenerationKeepAlivePlugin {
  start(options: GenerationForegroundContent): Promise<void>;
  update(options: GenerationForegroundContent): Promise<void>;
  finish(options: GenerationForegroundContent): Promise<void>;
  stop(): Promise<void>;
}

export const GenerationKeepAlive = registerPlugin<GenerationKeepAlivePlugin>('GenerationKeepAlive');
