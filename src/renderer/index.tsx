import { createRoot } from 'react-dom/client';
import './App.global.css';
import { RecoilRoot, useRecoilValue } from 'recoil';
import App from './App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Titlebar } from './components/general/Titlebar';
import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { themeState } from './state/settingStates';
import { themeProps } from './util/themes';
import { Theme } from '@/common/models/types';
import { useEffect } from 'react';

const main = document.createElement('main');
document.body.appendChild(main);
const root = createRoot(main);

function Root() {
  const theme = useRecoilValue(themeState);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme === Theme.Light ? 'light' : 'dark');
  }, [theme]);

  return (
    <MantineProvider>
      <header id="titlebar">
        <Titlebar />
      </header>
      <div id="root" {...themeProps(theme)}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </div>
    </MantineProvider>
  );
}

root.render(
  <RecoilRoot>
    <Root />
  </RecoilRoot>,
);
