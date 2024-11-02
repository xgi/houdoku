import { Theme } from '@/common/models/types';
import { createTheme, MantineThemeOverride } from '@mantine/core';

export const THEMES: { [key in Theme]: MantineThemeOverride } = {
  /* eslint-disable */
  [Theme.Light]: createTheme({
    colors: {
      bg: [
        '#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da',
        '#adb5bd', '#868e96', '#495057', '#343a40', '#212529',
      ],
      fg: [
        '#212529', '#343a40', '#495057', '#868e96', '#adb5bd',
        '#ced4da', '#dee2e6', '#e9ecef', '#f1f3f5', '#f8f9fa',
      ],
    },
  }),
  [Theme.Dark]: createTheme({
    colors: {
      bg: [
        '#141414', '#1f1f1f', '#242424', '#2e2e2e', '#3b3b3b',
        '#424242', '#696969', '#828282', '#b8b8b8', '#c9c9c9',
      ],
      fg: [
        '#c9c9c9', '#b8b8b8', '#828282', '#696969', '#424242',
        '#3b3b3b', '#2e2e2e', '#242424', '#1f1f1f', '#141414',
      ],
    },
  }),
  [Theme.Black]: createTheme({
    colors: {
      bg: [
        '#000000', '#000000', '#1f1f1f', '#242424', '#2e2e2e',
        '#3b3b3b', '#696969', '#828282', '#b8b8b8', '#c9c9c9',
      ],
      fg: [
        '#c9c9c9', '#b8b8b8', '#828282', '#696969', '#3b3b3b',
        '#2e2e2e', '#242424', '#1f1f1f', '#000000', '#000000',
      ],
    },
  }),
  /* eslint-enable */
};

export const themeProps = (theme: Theme) => {
  return {
    'data-theme': theme.toString(),
  };
};
