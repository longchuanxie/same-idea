import React from 'react';

import { createRoot } from 'react-dom/client';

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
