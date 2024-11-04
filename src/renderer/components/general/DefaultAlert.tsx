import { Alert } from '@mantine/core';
import styles from './DefaultAlert.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof Alert.defaultProps;

const DefaultAlert: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <Alert
      {...themeProps(theme)}
      classNames={{ root: styles.root, body: styles.body, message: styles.message }}
      {...props}
    />
  );
};

export default DefaultAlert;
