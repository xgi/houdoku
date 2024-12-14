import { NumberInput } from '@mantine/core';
import styles from './DefaultNumberInput.module.css';

type Props = typeof NumberInput.defaultProps;

const DefaultNumberInput: React.FC<Props> = (props: Props) => {
  return (
    <NumberInput
      classNames={{
        root: styles.root,
        control: styles.control,
        controls: styles.controls,
        label: styles.label,
        input: styles.input,
        section: styles.section,
        wrapper: styles.wrapper,
      }}
      {...props}
    />
  );
};

export default DefaultNumberInput;
