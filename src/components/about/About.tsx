import React from 'react';
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import styles from './About.css';
import packageJson from '../../../package.json';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const About: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Title level={4} className={styles.title}>
        {packageJson.productName} v{packageJson.version}
      </Title>
      <Paragraph className={styles.paragraph}>
        Houdoku is a manga reader and library manager for the desktop. To add a
        series to your library, click the &quot;Add Series&quot; tab on the left
        panel and search for the series from a supported content source.
      </Paragraph>
      <Paragraph className={styles.paragraph}>
        This app does not host manga; it retrieves them from public websites
        (&quot;content sources&quot;). The content source for a series can be
        selected with the dropdown on the Add Series page. Houdoku is not
        affiliated with any content sources.
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
        License: {packageJson.license} (full text available at link above)
      </Paragraph>
    </>
  );
};

export default About;
