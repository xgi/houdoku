import { Drawer } from '@mantine/core';
import styles from './DefaultDrawerRoot.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Drawer.Root.defaultProps;

const DefaultDrawerRoot: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Drawer.Root
      {...themeProps(theme)}
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
