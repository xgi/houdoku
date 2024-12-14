import { Drawer } from '@mantine/core';
import styles from './DefaultDrawerRoot.module.css';

type Props = typeof Drawer.Root.defaultProps;

const DefaultDrawerRoot: React.FC<Props> = (props: Props) => {
  return (
    <Drawer.Root
      opened={props!.opened!}
      onClose={props!.onClose!}
      classNames={{
        root: styles.root,
        body: styles.body,
        inner: styles.inner,
        header: styles.header,
        content: styles.content,
      }}
      {...props}
    />
  );
};

export default DefaultDrawerRoot;
