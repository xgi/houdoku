import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.global.css';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { createWindowControlListeners } from './util/titlebar';

createWindowControlListeners();

const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
