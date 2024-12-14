import { MultiSelect } from '@mantine/core';
import styles from './DefaultMultiSelect.module.css';

type Props = typeof MultiSelect.defaultProps;

const DefaultMultiSelect: React.FC<Props> = (props: Props) => {
  return (
    <MultiSelect
      classNames={{
        root: styles.root,
        input: styles.input,
        label: styles.label,
        pill: styles.pill,
      }}
      {...props}
    />
  );
};

export default DefaultMultiSelect;
