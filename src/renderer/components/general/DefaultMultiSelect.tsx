import { MultiSelect } from '@mantine/core';
import styles from './DefaultMultiSelect.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof MultiSelect.defaultProps;

const DefaultMultiSelect: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <MultiSelect
      wrapperProps={themeProps(theme)}
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
