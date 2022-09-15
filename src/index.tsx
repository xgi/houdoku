import React from 'react';
import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';
import './App.global.css';
import { createWindowControlListeners } from './util/titlebar';

createWindowControlListeners();
render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  document.getElementById('root')
);
