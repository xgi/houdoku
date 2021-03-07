import { ContentWarning, ContentWarningKey } from './types';

// eslint-disable-next-line import/prefer-default-export
export const ContentWarnings: { [key: string]: ContentWarning } = {
  [ContentWarningKey.ECCHI]: { key: ContentWarningKey.ECCHI, name: 'Ecchi' },
  [ContentWarningKey.SMUT]: { key: ContentWarningKey.SMUT, name: 'Smut' },
  [ContentWarningKey.GORE]: { key: ContentWarningKey.GORE, name: 'Gore' },
  [ContentWarningKey.SEXUAL_VIOLENCE]: {
    key: ContentWarningKey.SEXUAL_VIOLENCE,
    name: 'Sexual Violence',
  },
};
