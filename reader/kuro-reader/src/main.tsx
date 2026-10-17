import React from 'react';

import { createRoot } from 'react-dom/client';

// i18n 底座先于一切 UI 模块加载（全局 t 依赖 init 副作用；zh 缺省即显示中文 key）
import '@/i18n';

import { registerStatsApplier } from '@/services/cloudSync';
import { useStatsStore } from '@/stores/useStatsStore';
import { initNativeFeatures } from '@/utils/capacitor';

import App from './App';
import './index.css';

initNativeFeatures();

// 云同步拉取落地：把同步后的阅读时长簿回写统计 store（zustand persist 自动持久化）
registerStatsApplier((stats) => useStatsStore.getState().restoreStats(stats));

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
