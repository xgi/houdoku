import { Text } from '@mantine/core';
import styles from './DefaultText.module.css';

type Props = typeof Text.defaultProps;

const DefaultText: React.FC<Props> = (props: Props) => {
  return <Text classNames={{ root: styles.root }} {...props} />;
};

export default DefaultText;
