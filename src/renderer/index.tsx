import { createRoot } from 'react-dom/client';
import './App.global.css';
import { RecoilRoot } from 'recoil';
import App from './App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import Titlebar from './components/titlebar/Titlebar';

const main = document.createElement('main');
document.body.appendChild(main);
const root = createRoot(main);
root.render(
  <RecoilRoot>
    <header id="titlebar">
      <Titlebar />
    </header>
    <div id="root">
      <App />
    </div>
  </RecoilRoot>,
);
