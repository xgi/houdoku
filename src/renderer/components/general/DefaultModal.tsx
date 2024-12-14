import { Modal } from '@mantine/core';
import styles from './DefaultModal.module.css';

type Props = typeof Modal.defaultProps;

const DefaultModal: React.FC<Props> = (props: Props) => {
  return (
    <Modal
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
