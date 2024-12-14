import { TagsInput } from '@mantine/core';
import styles from './DefaultTagsInput.module.css';

type Props = typeof TagsInput.defaultProps;

const DefaultTagsInput: React.FC<Props> = (props: Props) => {
  return (
    <TagsInput
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

export default DefaultTagsInput;
