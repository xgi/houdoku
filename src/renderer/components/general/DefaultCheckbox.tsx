import { Checkbox } from '@mantine/core';
import styles from './DefaultCheckbox.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Checkbox.defaultProps;

const DefaultCheckbox: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Checkbox
      {...themeProps(theme)}
      wrapperProps={{ ...themeProps(theme) }}
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
