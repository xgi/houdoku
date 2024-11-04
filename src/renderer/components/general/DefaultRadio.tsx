import { Radio } from '@mantine/core';
import styles from './DefaultRadio.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Radio.defaultProps;

const DefaultRadio: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Radio
      {...themeProps(theme)}
      wrapperProps={{ ...themeProps(theme) }}
      classNames={{
        root: styles.root,
        label: styles.label,
        inner: styles.inner,
        radio: styles.radio,
        description: styles.description,
      }}
      {...props}
    />
  );
};

export default DefaultRadio;
