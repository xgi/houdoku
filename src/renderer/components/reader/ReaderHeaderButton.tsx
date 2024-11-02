import { Button } from '@mantine/core';
import styles from './ReaderHeaderButton.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import { forwardRef, RefObject } from 'react';

type Props = {
  children?: React.ReactNode;
} & typeof Button.defaultProps;

const ReaderHeaderButton = forwardRef<RefObject<React.ComponentPropsWithoutRef<'div'>>, Props>(
  (props, ref) => {
    const theme = useRecoilValue(themeState);

    return (
      <Button
        {...themeProps(theme)}
        classNames={{ root: styles.root }}
        ref={ref}
        size="xs"
        radius={0}
        {...props}
      >
        {props.children}
      </Button>
    );
  },
);

export default ReaderHeaderButton;
