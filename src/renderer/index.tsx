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
import { THEMES } from './util/themes';

const main = document.createElement('main');
document.body.appendChild(main);
const root = createRoot(main);

function Root() {
  const theme = useRecoilValue(themeState);

  return (
    <MantineProvider theme={THEMES[theme]} forceColorScheme="dark">
      <ErrorBoundary>
        <header id="titlebar">
          <Titlebar />
        </header>
        <div id="root">
          <App />
        </div>
      </ErrorBoundary>
    </MantineProvider>
  );
}

root.render(
  <RecoilRoot>
    <Root />
  </RecoilRoot>,
);
