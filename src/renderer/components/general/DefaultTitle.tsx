import { Title } from '@mantine/core';
import styles from './DefaultTitle.module.css';

type Props = typeof Title.defaultProps;

const DefaultTitle: React.FC<Props> = (props: Props) => {
  return <Title classNames={{ root: styles.root }} {...props} />;
};

export default DefaultTitle;
