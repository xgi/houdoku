import { Button } from '@mantine/core';
import styles from './ReaderHeaderButton.module.css';
import { forwardRef, RefObject } from 'react';

type Props = {
  children?: React.ReactNode;
} & typeof Button.defaultProps;

const ReaderHeaderButton = forwardRef<RefObject<React.ComponentPropsWithoutRef<'div'>>, Props>(
  (props, ref) => {
    return (
      <Button classNames={{ root: styles.root }} ref={ref} size="xs" radius={0} {...props}>
        {props.children}
      </Button>
    );
  },
);

export default ReaderHeaderButton;
