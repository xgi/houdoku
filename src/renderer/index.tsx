import { createRoot } from 'react-dom/client';
import './App.global.css';
import { RecoilRoot, useRecoilValue } from 'recoil';
import App from './App';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import Titlebar from './components/titlebar/Titlebar';
import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from './components/general/ErrorBoundary';
import { themeState } from './state/settingStates';
import { themeProps, THEMES } from './util/themes';
import { Theme } from '@/common/models/types';

const main = document.createElement('main');
document.body.appendChild(main);
const root = createRoot(main);

function Root() {
  const theme = useRecoilValue(themeState);

  // TODO hack to ignore some remaning theme changes
  const forceColorScheme = theme === Theme.Light ? 'light' : 'dark';

  return (
    <MantineProvider theme={THEMES[theme]} forceColorScheme={forceColorScheme}>
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
