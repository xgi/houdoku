import { Select } from '@mantine/core';
import styles from './DefaultSelect.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';
import { Theme } from '@/common/models/types';

type Props = typeof Select.defaultProps;

const DefaultSelect: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Select
      wrapperProps={themeProps(theme)}
      classNames={{
        root: styles.root,
        input: styles.input,
        label: styles.label,
        option: styles.option,
        // TODO hack because no way to pass theme prop to this div
        dropdown: {
          [Theme.Light]: styles.dropdownLight,
          [Theme.Dark]: styles.dropdownDark,
          [Theme.Black]: styles.dropdownBlack,
        }[theme],
      }}
      {...props}
    />
  );
};

export default DefaultSelect;
