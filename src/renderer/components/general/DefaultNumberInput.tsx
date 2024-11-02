import { NumberInput } from '@mantine/core';
import styles from './DefaultNumberInput.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof NumberInput.defaultProps;

const DefaultNumberInput: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <NumberInput
      {...themeProps(theme)}
      labelProps={{ ...themeProps(theme) }}
      wrapperProps={{ ...themeProps(theme) }}
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
