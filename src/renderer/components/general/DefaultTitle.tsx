import { Title } from '@mantine/core';
import styles from './DefaultTitle.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Title.defaultProps;

const DefaultTitle: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return <Title {...themeProps(theme)} classNames={{ root: styles.root }} {...props} />;
};

export default DefaultTitle;
