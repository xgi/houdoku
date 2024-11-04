import { Input } from '@mantine/core';
import styles from './DefaultInput.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = { label?: string; flexWrapper?: boolean | undefined } & typeof Input.defaultProps;

const DefaultInput: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Input.Wrapper
      labelProps={{ ...themeProps(theme) }}
      classNames={{ root: props.flexWrapper ? styles.flexRoot : undefined, label: styles.label }}
      label={props.label}
    >
      <Input {...themeProps(theme)} classNames={{ input: styles.input }} {...props}></Input>
    </Input.Wrapper>
  );
};

export default DefaultInput;
