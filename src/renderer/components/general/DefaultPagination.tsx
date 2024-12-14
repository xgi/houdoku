import { Pagination } from '@mantine/core';
import styles from './DefaultPagination.module.css';

type Props = typeof Pagination.defaultProps;

const DefaultPagination: React.FC<Props> = (props: Props) => {
  return (
    <Pagination
      total={props!.total!}
      classNames={{
        root: styles.root,
        control: styles.control,
        dots: styles.dots,
      }}
      {...props}
    />
  );
};

export default DefaultPagination;
