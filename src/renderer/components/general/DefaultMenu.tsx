import { Menu, MenuProps } from '@mantine/core';
import styles from './DefaultMenu.module.css';

type Props = MenuProps;

const DefaultMenu: React.FC<Props> = (props: Props) => {
  return (
    <Menu
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
