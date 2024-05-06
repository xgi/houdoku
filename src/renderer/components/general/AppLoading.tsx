import React from 'react';
import { Title, Text, Image } from '@mantine/core';
import styles from './AppLoading.module.css';
import { AppLoadStep } from '@/common/models/types';
import logo from '@/renderer/img/logo.svg';

type Props = {
  step?: AppLoadStep;
};

const AppLoading: React.FC<Props> = () => {
  return (
    <div className={styles.container}>
      <Image className={styles.logo} src={logo} w={96} h={96} />
      <Title order={5} mt="sm" c="teal" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
        Houdoku is loading
      </Title>
      <Text size={'md'} ta="center" mt="sm">
        If this message does not disappear automatically,
        <br />
        please restart the client.
      </Text>
    </div>
  );
};

export default AppLoading;
