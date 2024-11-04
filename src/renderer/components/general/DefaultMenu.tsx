import { Menu, MenuProps } from '@mantine/core';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';
import styles from './DefaultMenu.module.css';

type Props = MenuProps;

const DefaultMenu: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Menu
      {...themeProps(theme)}
      classNames={{
        dropdown: styles.dropdown,
        item: styles.item,
        label: styles.label,
        divider: styles.divider,
      }}
      {...props}
    />
  );
};

export default DefaultMenu;
