import { Theme, ThemeKey } from './types';

// eslint-disable-next-line import/prefer-default-export
export const Themes: { [key: string]: Theme } = {
  [ThemeKey.COOKING]: { key: ThemeKey.COOKING, name: 'Cooking' },
  [ThemeKey.GYARU]: { key: ThemeKey.GYARU, name: 'Gyaru' },
  [ThemeKey.HAREM]: { key: ThemeKey.HAREM, name: 'Harem' },
  [ThemeKey.MARTIAL_ARTS]: { key: ThemeKey.MARTIAL_ARTS, name: 'Martial Arts' },
  [ThemeKey.MUSIC]: { key: ThemeKey.MUSIC, name: 'Music' },
  [ThemeKey.SCHOOL_LIFE]: { key: ThemeKey.SCHOOL_LIFE, name: 'School Life' },
  [ThemeKey.SUPERNATURAL]: { key: ThemeKey.SUPERNATURAL, name: 'Supernatural' },
  [ThemeKey.VIDEO_GAMES]: { key: ThemeKey.VIDEO_GAMES, name: 'Video Games' },
  [ThemeKey.ALIENS]: { key: ThemeKey.ALIENS, name: 'Aliens' },
  [ThemeKey.ANIMALS]: { key: ThemeKey.ANIMALS, name: 'Animals' },
  [ThemeKey.CROSSDRESSING]: {
    key: ThemeKey.CROSSDRESSING,
    name: 'Crossdressing',
  },
  [ThemeKey.DEMONS]: { key: ThemeKey.DEMONS, name: 'Demons' },
  [ThemeKey.DELINQUENTS]: { key: ThemeKey.DELINQUENTS, name: 'Delinquents' },
  [ThemeKey.GENDERSWAP]: { key: ThemeKey.GENDERSWAP, name: 'Genderswap' },
  [ThemeKey.GHOSTS]: { key: ThemeKey.GHOSTS, name: 'Ghosts' },
  [ThemeKey.MONSTER_GIRLS]: {
    key: ThemeKey.MONSTER_GIRLS,
    name: 'Monster Girls',
  },
  [ThemeKey.LOLI]: { key: ThemeKey.LOLI, name: 'Loli' },
  [ThemeKey.MAGIC]: { key: ThemeKey.MAGIC, name: 'Magic' },
  [ThemeKey.MILITARY]: { key: ThemeKey.MILITARY, name: 'Military' },
  [ThemeKey.MONSTERS]: { key: ThemeKey.MONSTERS, name: 'Monsters' },
  [ThemeKey.NINJA]: { key: ThemeKey.NINJA, name: 'Ninja' },
  [ThemeKey.OFFICE_WORKERS]: {
    key: ThemeKey.OFFICE_WORKERS,
    name: 'Office Workers',
  },
  [ThemeKey.POLICE]: { key: ThemeKey.POLICE, name: 'Police' },
  [ThemeKey.POST_APOCALYPTIC]: {
    key: ThemeKey.POST_APOCALYPTIC,
    name: 'Post Apocalyptic',
  },
  [ThemeKey.REINCARNATION]: {
    key: ThemeKey.REINCARNATION,
    name: 'Reincarnation',
  },
  [ThemeKey.REVERSE_HAREM]: {
    key: ThemeKey.REVERSE_HAREM,
    name: 'Reverse Harem',
  },
  [ThemeKey.SAMURAI]: { key: ThemeKey.SAMURAI, name: 'Samurai' },
  [ThemeKey.SHOTA]: { key: ThemeKey.SHOTA, name: 'Shota' },
  [ThemeKey.SURVIVAL]: { key: ThemeKey.SURVIVAL, name: 'Survival' },
  [ThemeKey.TIME_TRAVEL]: { key: ThemeKey.TIME_TRAVEL, name: 'Time Travel' },
  [ThemeKey.VAMPIRES]: { key: ThemeKey.VAMPIRES, name: 'Vampires' },
  [ThemeKey.TRADITIONAL_GAMES]: {
    key: ThemeKey.TRADITIONAL_GAMES,
    name: 'Traditional Games',
  },
  [ThemeKey.VIRTUAL_REALITY]: {
    key: ThemeKey.VIRTUAL_REALITY,
    name: 'Virtual Reality',
  },
  [ThemeKey.ZOMBIES]: { key: ThemeKey.ZOMBIES, name: 'Zombies' },
  [ThemeKey.INCEST]: { key: ThemeKey.INCEST, name: 'Incest' },
  [ThemeKey.MAFIA]: { key: ThemeKey.MAFIA, name: 'Mafia' },
  [ThemeKey.VILLAINESS]: { key: ThemeKey.VILLAINESS, name: 'Villainess' },
};

export const themeKeysFromNames = (names: string[]) => {
  return names.map((name: string) => {
    const matching: Theme | undefined = Object.values(Themes).find(
      (theme: Theme) => theme.name === name
    );
    return matching === undefined ? -1 : matching.key;
  });
};
