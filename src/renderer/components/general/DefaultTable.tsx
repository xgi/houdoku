import { Table } from '@mantine/core';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';
import styles from './DefaultTable.module.css';

type Props = {} & typeof Table.defaultProps;

const DefaultTable: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Table {...themeProps(theme)} classNames={{ tr: styles.tr, tbody: styles.tbody }} {...props} />
  );
};

export default DefaultTable;
