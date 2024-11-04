import React from 'react';
import { Image } from '@mantine/core';
import styles from './AppLoading.module.css';
import { AppLoadStep } from '@/common/models/types';
import logo from '@/renderer/img/logo.svg';
import DefaultTitle from './DefaultTitle';
import DefaultText from './DefaultText';

type Props = {
  step?: AppLoadStep;
};

const AppLoading: React.FC<Props> = () => {
  return (
    <div className={styles.container}>
      <Image className={styles.logo} src={logo} w={96} h={96} />
      <DefaultTitle order={5} mt="lg" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
        Houdoku is loading
      </DefaultTitle>
      <DefaultText>Please wait a moment.</DefaultText>
    </div>
  );
};

export default AppLoading;
