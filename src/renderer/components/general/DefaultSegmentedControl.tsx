import { SegmentedControl, SegmentedControlItem } from '@mantine/core';
import styles from './DefaultSegmentedControl.module.css';

type Props = { data: (string | SegmentedControlItem)[] } & typeof SegmentedControl.defaultProps;

const DefaultSegmentedControl: React.FC<Props> = (props: Props) => {
  return (
    <SegmentedControl
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
