import React from 'react';
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import { Button } from 'antd';
import { ipcRenderer } from 'electron';
import styles from './About.css';
import packageJson from '../../../package.json';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const About: React.FC<Props> = (props: Props) => {
  const handleUpdateCheck = () => {
    ipcRenderer.invoke('check-for-updates');
  };

  return (
    <>
      <Title level={4} className={styles.title}>
        {packageJson.productName} v{packageJson.version}
      </Title>
      <Button className={styles.updateButton} onClick={handleUpdateCheck}>
        Check for Updates
      </Button>
      <Paragraph className={styles.paragraph}>
        Houdoku is a manga reader and library manager for the desktop. To add a
        series to your library, click the &quot;Add Series&quot; tab on the left
        panel and search for the series from a supported content source.
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        This app does not host manga; it retrieves them from public websites
        (&quot;content sources&quot;). Support for content sources is provided
        through various extensions, which can be installed/updated from the
        Extensions tab. You can select which content source to use for each
        series on the Add Series page.
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        Houdoku is open source! Check the link below to contribute.
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        Website:{' '}
        <a href={packageJson.homepage} target="_blank" rel="noreferrer">
          {packageJson.homepage}
        </a>
        <br />
        Maintainer: {packageJson.author.name} ({packageJson.author.email})
        <br />
        License: MIT (
        <a
          href={`${packageJson.homepage}/blob/master/LICENSE.txt`}
          target="_blank"
          rel="noreferrer"
        >
          view text
        </a>
        )
      </Paragraph>
    </>
  );
};

export default About;
