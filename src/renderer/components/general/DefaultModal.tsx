import { Modal } from '@mantine/core';
import styles from './DefaultModal.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Modal.defaultProps;

const DefaultModal: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Modal
      {...themeProps(theme)}
      opened={props!.opened!}
      onClose={props!.onClose!}
      // portalProps={}
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

export default DefaultModal;
