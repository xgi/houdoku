import { Select } from '@mantine/core';
import styles from './DefaultSelect.module.css';

type Props = typeof Select.defaultProps;

const DefaultSelect: React.FC<Props> = (props: Props) => {
  return (
    <Select
      classNames={{
        root: styles.root,
        input: styles.input,
        label: styles.label,
        option: styles.option,
      }}
      {...props}
    />
  );
};

export default DefaultSelect;
