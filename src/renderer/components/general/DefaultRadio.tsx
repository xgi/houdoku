import { Radio } from '@mantine/core';
import styles from './DefaultRadio.module.css';

type Props = typeof Radio.defaultProps;

const DefaultRadio: React.FC<Props> = (props: Props) => {
  return (
    <Radio
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
