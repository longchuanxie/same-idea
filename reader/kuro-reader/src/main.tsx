import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { initNativeFeatures } from '@/utils/capacitor';
import './index.css';

initNativeFeatures();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
