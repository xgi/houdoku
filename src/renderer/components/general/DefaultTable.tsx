import { Table } from '@mantine/core';
import styles from './DefaultTable.module.css';

type Props = {} & typeof Table.defaultProps;

const DefaultTable: React.FC<Props> = (props: Props) => {
  return <Table classNames={{ tr: styles.tr, tbody: styles.tbody }} {...props} />;
};

export default DefaultTable;
