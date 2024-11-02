import { Text } from '@mantine/core';
import styles from './DefaultText.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Text.defaultProps;

const DefaultText: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return <Text {...themeProps(theme)} classNames={{ root: styles.root }} {...props} />;
};

export default DefaultText;
