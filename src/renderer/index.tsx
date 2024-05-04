import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import App from './App';
import './App.global.css';
import { createWindowControlListeners } from './util/titlebar';

createWindowControlListeners();
const container = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(
  <RecoilRoot>
    <App />
  </RecoilRoot>
);
