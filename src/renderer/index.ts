import React from 'react';
import { createRoot } from 'react-dom/client';
import './App.global.css';
import { createWindowControlListeners } from './util/titlebar';
import { RecoilRoot } from 'recoil';
import App from './App';

createWindowControlListeners();
const container = document.getElementById('root');
const root = createRoot(container!);

root.render(React.createElement(RecoilRoot, null, React.createElement(App)));
