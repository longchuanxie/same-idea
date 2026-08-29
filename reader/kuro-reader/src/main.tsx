import React from 'react';

import { createRoot } from 'react-dom/client';

import { initNativeFeatures } from '@/utils/capacitor';

import App from './App';
import './index.css';

initNativeFeatures();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
