import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// React 18+ 권장 방식
const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
