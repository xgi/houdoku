import React from 'react';
import { Title, Text, Image } from '@mantine/core';
import styles from './AppLoading.css';
import { AppLoadStep } from '../../../common/models/types';
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
      <Title
        order={5}
        mt="sm"
        autoCapitalize="characters"
        color="teal"
        style={{ letterSpacing: 1 }}
      >
        HOUDOKU IS LOADING
      </Title>
      <Text size={16} align="center" mt="md">
        If this message does not disappear automatically,
        <br />
        please restart the client.
      </Text>
    </div>
  );
};

export default AppLoading;
