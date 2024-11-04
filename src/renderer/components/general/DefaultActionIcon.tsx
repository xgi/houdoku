import { ActionIcon } from '@mantine/core';
import styles from './DefaultActionIcon.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import { forwardRef, RefObject } from 'react';

type Props = {
  oc: 'orange' | 'teal' | 'grape' | 'red' | 'blue' | 'yellow' | 'gray';
  transparent?: boolean | undefined;
} & typeof ActionIcon.defaultProps;

const DefaultActionIcon = forwardRef<RefObject<React.ComponentPropsWithoutRef<'div'>>, Props>(
  (props, ref) => {
    const theme = useRecoilValue(themeState);

    return (
      <ActionIcon
        {...themeProps(theme)}
        classNames={{ root: styles.root }}
        data-oc={props.oc}
        data-transparent={props.transparent}
        ref={ref}
        {...props}
      />
    );
  },
);

export default DefaultActionIcon;
