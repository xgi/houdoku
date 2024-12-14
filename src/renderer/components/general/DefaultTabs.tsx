import { Tabs } from '@mantine/core';
import styles from './DefaultTabs.module.css';

type Props = {} & typeof Tabs.defaultProps;

const DefaultTabs: React.FC<Props> = (props: Props) => {
  return <Tabs classNames={{ root: styles.root, list: styles.list }} {...props} />;
};

export default DefaultTabs;
