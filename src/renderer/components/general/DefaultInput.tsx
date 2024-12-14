import { Input } from '@mantine/core';
import styles from './DefaultInput.module.css';

type Props = { label?: string; flexWrapper?: boolean | undefined } & typeof Input.defaultProps;

const DefaultInput: React.FC<Props> = (props: Props) => {
  return (
    <Input.Wrapper
      classNames={{ root: props.flexWrapper ? styles.flexRoot : undefined, label: styles.label }}
      label={props.label}
    >
      <Input classNames={{ input: styles.input }} {...props}></Input>
    </Input.Wrapper>
  );
};

export default DefaultInput;
