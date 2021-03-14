import { Format, FormatKey } from './types';

// eslint-disable-next-line import/prefer-default-export
export const Formats: { [key: string]: Format } = {
  [FormatKey.YONKOMA]: { key: FormatKey.YONKOMA, name: 'Yonkoma' },
  [FormatKey.AWARD_WINNING]: {
    key: FormatKey.AWARD_WINNING,
    name: 'Award Winning',
  },
  [FormatKey.DOUJINSHI]: { key: FormatKey.DOUJINSHI, name: 'Doujinshi' },
  [FormatKey.ONESHOT]: { key: FormatKey.ONESHOT, name: 'Oneshot' },
  [FormatKey.LONG_STRIP]: { key: FormatKey.LONG_STRIP, name: 'Long Strip' },
  [FormatKey.ADAPTATION]: { key: FormatKey.ADAPTATION, name: 'Adaptation' },
  [FormatKey.ANTHOLOGY]: { key: FormatKey.ANTHOLOGY, name: 'Anthology' },
  [FormatKey.WEB_COMIC]: { key: FormatKey.WEB_COMIC, name: 'Web Comic' },
  [FormatKey.FULL_COLOR]: { key: FormatKey.FULL_COLOR, name: 'Full Color' },
  [FormatKey.USER_CREATED]: {
    key: FormatKey.USER_CREATED,
    name: 'User Created',
  },
  [FormatKey.OFFICIAL_COLORED]: {
    key: FormatKey.OFFICIAL_COLORED,
    name: 'Official Colored',
  },
  [FormatKey.FAN_COLORED]: { key: FormatKey.FAN_COLORED, name: 'Fan Colored' },
};

export const formatKeysFromNames = (names: string[]) => {
  return names.map((name: string) => {
    const matching: Format | undefined = Object.values(Formats).find(
      (format: Format) => format.name === name
    );
    return matching === undefined ? -1 : matching.key;
  });
};
