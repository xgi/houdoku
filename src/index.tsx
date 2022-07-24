import React from 'react';
import { render } from 'react-dom';
import { RecoilRoot } from 'recoil';
import App from './App';
import './App.global.css';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { createWindowControlListeners } from './util/titlebar';

createWindowControlListeners();
render(
  <ErrorBoundary>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </ErrorBoundary>,
  document.getElementById('root')
);
