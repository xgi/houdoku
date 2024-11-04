import { Timeline } from '@mantine/core';
import styles from './DefaultTimeline.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = {} & typeof Timeline.defaultProps;

const DefaultTimeline: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Timeline
      {...themeProps(theme)}
      classNames={{ root: styles.root, item: styles.item, itemBullet: styles.bullet }}
      {...props}
    />
  );
};

export default DefaultTimeline;
