import { Tabs } from '@mantine/core';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';
import styles from './DefaultTabs.module.css';

type Props = {} & typeof Tabs.defaultProps;

const DefaultTabs: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Tabs {...themeProps(theme)} classNames={{ root: styles.root, list: styles.list }} {...props} />
  );
};

export default DefaultTabs;
