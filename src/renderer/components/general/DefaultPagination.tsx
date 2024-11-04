import { Pagination } from '@mantine/core';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';
import styles from './DefaultPagination.module.css';

type Props = typeof Pagination.defaultProps;

const DefaultPagination: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Pagination
      {...themeProps(theme)}
      total={props!.total!}
      getControlProps={() => ({ ...themeProps(theme) })}
      getItemProps={() => ({ ...themeProps(theme) })}
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
