import { Checkbox } from '@mantine/core';
import styles from './DefaultCheckbox.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';

type Props = typeof Checkbox.defaultProps;

const DefaultCheckbox: React.FC<Props> = (props: Props) => {
  return (
    <Checkbox
      classNames={{
        root: styles.root,
        label: styles.label,
        inner: styles.inner,
        input: styles.input,
        description: styles.description,
      }}
      {...props}
    />
  );
};

export default DefaultCheckbox;
