import React from 'react';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Image } from 'antd';
import Title from 'antd/lib/typography/Title';
import styles from './AppLoading.css';
import { AppLoadStep } from '../../models/types';
import logo from '../../img/logo.svg';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  // eslint-disable-next-line react/no-unused-prop-types
  step?: AppLoadStep;
};

const AppLoading: React.FC<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <Image className={styles.logo} src={logo} width={96} height={96} />
      <Title level={5} className={styles.title}>
        houdoku is loading
      </Title>
      <Paragraph className={styles.paragraph}>
        If this message does not disappear automatically,
        <br />
        please restart the client.
      </Paragraph>
    </div>
  );
};

export default AppLoading;
