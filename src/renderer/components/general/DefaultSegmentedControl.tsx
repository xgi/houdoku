import { SegmentedControl, SegmentedControlItem } from '@mantine/core';
import styles from './DefaultSegmentedControl.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = { data: (string | SegmentedControlItem)[] } & typeof SegmentedControl.defaultProps;

const DefaultSegmentedControl: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <SegmentedControl
      {...themeProps(theme)}
      classNames={{
        root: styles.root,
        control: styles.control,
        label: styles.label,
        indicator: styles.indicator,
      }}
      {...props}
    />
  );
};

export default DefaultSegmentedControl;
