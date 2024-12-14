import { Timeline } from '@mantine/core';
import styles from './DefaultTimeline.module.css';

type Props = {} & typeof Timeline.defaultProps;

const DefaultTimeline: React.FC<Props> = (props: Props) => {
  return (
    <Timeline
      classNames={{ root: styles.root, item: styles.item, itemBullet: styles.bullet }}
      {...props}
    />
  );
};

export default DefaultTimeline;
