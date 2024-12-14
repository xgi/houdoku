import { ActionIcon } from '@mantine/core';
import styles from './DefaultActionIcon.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
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
