import React, { useEffect, useState } from 'react';
import aki, { RegistrySearchResults } from 'aki-plugin-manager';
import { Col, Row, Button, Spin } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Paragraph from 'antd/lib/typography/Paragraph';
import Title from 'antd/lib/typography/Title';
import styles from './Extensions.css';
import { RootState } from '../../store';
import ExtensionTable from './ExtensionTable';

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Extensions: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<RegistrySearchResults>();
  const location = useLocation();

  const doSearchRegistry = () => {
    setSearchResults(undefined);
    aki
      .search({ text: 'extension', scope: 'houdoku' })
      .then((results: RegistrySearchResults) => {
        return setSearchResults(results);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    doSearchRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <Title className={styles.title} level={4}>
        Extensions
      </Title>
      <Row className={styles.row}>
        <Col span={14}>
          <Button onClick={() => doSearchRegistry()}>
            Reload Extension List
          </Button>
        </Col>
      </Row>
      {searchResults === undefined ? (
        <div className={styles.loadingContainer}>
          <Spin />
          <Paragraph>Loading extension list...</Paragraph>
          <Paragraph>This requires an internet connection.</Paragraph>
        </div>
      ) : (
        <ExtensionTable registryResults={searchResults} />
      )}
    </>
  );
};

export default connector(Extensions);
