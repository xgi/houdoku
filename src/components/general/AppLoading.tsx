import React from 'react';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Spin } from 'antd';
import styles from './AppLoading.css';
import { AppLoadStep } from '../../models/types';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {
  step: AppLoadStep | null;
};

const AppLoading: React.FC<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <Spin />
      <Paragraph className={styles.paragraph}>
        {props.step === AppLoadStep.DatabaseInit
          ? 'Initializing database...'
          : ''}
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        If this message does not disappear automatically, please restart the
        client.
      </Paragraph>
    </div>
  );
};

export default AppLoading;
