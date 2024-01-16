import React from 'react';
import { ColorScheme, Switch, useMantineTheme } from '@mantine/core';
import { IconSun, IconMoonStars } from '@tabler/icons';

interface Props {
  colorScheme: ColorScheme;
  toggleColorScheme: (value?: ColorScheme) => void;
}

const ToggleThemeSwitch: React.FC<Props> = (props: Props) => {
  const { colorScheme, toggleColorScheme } = props;
  const theme = useMantineTheme();

  return (
    <Switch
      size="sm"
      onLabel={<IconSun size="0.7rem" stroke={2.5} color={theme.colors.yellow[4]} />}
      offLabel={<IconMoonStars size="0.7rem" stroke={2.5} color={theme.colors.blue[6]} />}
      checked={colorScheme !== 'dark'}
      onChange={() => toggleColorScheme()}
      styles={{
        root: { position: 'fixed', left: '0.5rem', bottom: '0.5rem', zIndex: 1000 },
      }}
    />
  );
};

export default ToggleThemeSwitch;
