import { Button } from '@mantine/core';
import styles from './DefaultButton.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import { forwardRef, RefObject } from 'react';

type Props = {
  oc: 'orange' | 'teal' | 'grape' | 'red' | 'blue' | 'yellow' | 'gray';
} & typeof Button.defaultProps;

const DefaultButton = forwardRef<RefObject<React.ComponentPropsWithoutRef<'div'>>, Props>(
  (props, ref) => {
    const theme = useRecoilValue(themeState);

    return (
      <Button
        {...themeProps(theme)}
        classNames={{ root: styles.root }}
        data-oc={props.oc}
        ref={ref}
        {...props}
      />
    );
  },
);

export default DefaultButton;
