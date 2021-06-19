/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Dropdown,
  InputNumber,
  List,
  Menu,
  Modal,
  Row,
  Spin,
  Tabs,
} from 'antd';
import { DownOutlined, CheckOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import styles from './SeriesTrackerModal.css';
import ipcChannels from '../../constants/ipcChannels.json';
import { AniListTrackerMetadata } from '../../services/trackers/anilist';
import { TrackEntry, TrackerSeries, TrackStatus } from '../../models/types';
import { updateSeriesTrackerKeys } from '../../features/library/utils';

const { TabPane } = Tabs;

type Props = {
  series: Series;
  loadSeriesContent: () => void;
  visible: boolean;
  toggleVisible: () => void;
};

const SeriesTrackerModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [trackerKey, setTrackerKey] = useState('');
  const [trackerSeriesList, setTrackerSeriesList] = useState<TrackerSeries[]>(
    []
  );
  const [trackEntry, setTrackEntry] = useState<TrackEntry>();

  const updateLibraryEntry = (_trackEntry: TrackEntry) => {
    setLoading(true);

    ipcRenderer
      .invoke(
        ipcChannels.TRACKER.UPDATE_LIBRARY_ENTRY,
        AniListTrackerMetadata.id,
        _trackEntry
      )
      .then((libraryEntry: TrackEntry) =>
        setTrackEntry(
          libraryEntry !== null
            ? libraryEntry
            : {
                seriesId: trackerKey,
                progress: 0,
                status: TrackStatus.Reading,
              }
        )
      )
      .catch((e) => log.error(e))
      .finally(() => setLoading(false))
      .catch((e) => log.error(e));
  };

  const loadTrackerSeriesList = () => {
    setLoading(true);

    ipcRenderer
      .invoke(
        ipcChannels.TRACKER.SEARCH,
        AniListTrackerMetadata.id,
        props.series.title
      )
      .then((_seriesList: TrackerSeries[]) =>
        setTrackerSeriesList(_seriesList.slice(0, 5))
      )
      .catch((e) => log.error(e))
      .finally(() => setLoading(false))
      .catch((e) => log.error(e));
  };

  const applySeriesTrackerKey = (key: string) => {
    const newTrackerKeys = {
      ...props.series.trackerKeys,
      [AniListTrackerMetadata.id]: key,
    };

    updateSeriesTrackerKeys(props.series, newTrackerKeys, () => {
      setTrackerKey(key);
      props.loadSeriesContent();
    });
  };

  const renderTrackerSeriesList = () => {
    return (
      <List
        header={null}
        footer={null}
        bordered
        dataSource={trackerSeriesList}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            extra={
              <Button onClick={() => applySeriesTrackerKey(item.id)}>
                Link
              </Button>
            }
          >
            {/* {item.name} <a href={item.url}>{item.url}</a>) */}
            <List.Item.Meta
              avatar={
                <img
                  className={styles.coverImg}
                  src={item.coverUrl}
                  alt="cover"
                />
              }
              title={
                <Paragraph className={styles.listItemTitle}>
                  {item.title}
                </Paragraph>
              }
              description={
                <Paragraph className={styles.listItemDescription}>
                  {item.description.substr(0, 80)}...
                </Paragraph>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderTrackEntry = () => {
    if (trackEntry === undefined)
      return <Paragraph>Failed to define tracker entry.</Paragraph>;

    return (
      <>
        <Row className={styles.row}>
          <Col span={8}>Status</Col>
          <Col span={16}>
            <Dropdown
              overlay={
                <Menu
                  onClick={(e: any) =>
                    updateLibraryEntry({
                      ...trackEntry,
                      status: e.item.props['data-value'] as TrackStatus,
                    })
                  }
                >
                  <Menu.Item key={1} data-value={TrackStatus.Completed}>
                    {TrackStatus.Completed}
                  </Menu.Item>
                  <Menu.Item key={2} data-value={TrackStatus.Dropped}>
                    {TrackStatus.Dropped}
                  </Menu.Item>
                  <Menu.Item key={3} data-value={TrackStatus.Paused}>
                    {TrackStatus.Paused}
                  </Menu.Item>
                  <Menu.Item key={4} data-value={TrackStatus.Planning}>
                    {TrackStatus.Planning}
                  </Menu.Item>
                  <Menu.Item key={5} data-value={TrackStatus.Reading}>
                    {TrackStatus.Reading}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                {trackEntry?.status} <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={8}>Progress</Col>
          <Col span={16}>
            <span>
              <InputNumber
                className={styles.progressInput}
                min={0}
                value={trackEntry.progress}
                onChange={(value) =>
                  setTrackEntry({ ...trackEntry, progress: value })
                }
              />
              <Button
                className={styles.progressSubmitButton}
                icon={<CheckOutlined />}
                onClick={() => updateLibraryEntry(trackEntry)}
              />
            </span>
          </Col>
        </Row>
        <Row className={styles.row}>
          <Col span={8}>Score</Col>
          <Col span={16}>
            <Dropdown
              overlay={
                <Menu
                  onClick={(e: any) => {
                    updateLibraryEntry({
                      ...trackEntry,
                      score: parseInt(e.item.props['data-value'], 10),
                    });
                  }}
                >
                  {Array.from({ length: 5 }, (v, k) => k + 1).map(
                    (value: number) => (
                      <Menu.Item key={value} data-value={value}>
                        {value}
                      </Menu.Item>
                    )
                  )}
                </Menu>
              }
            >
              <Button>
                {trackEntry.score === undefined ? '-' : trackEntry.score}{' '}
                <DownOutlined />
              </Button>
            </Dropdown>
          </Col>
        </Row>
        <Paragraph className={styles.unlinkText}>
          <a
            onClick={() => {
              applySeriesTrackerKey('');
              loadTrackerSeriesList();
            }}
          >
            Unlink this series.
          </a>
        </Paragraph>
      </>
    );
  };

  const renderTrackerContent = () => {
    if (!authenticated) {
      return (
        <Paragraph>
          In order to track this series, please link your AniList account
          through the Settings tab on the left.
        </Paragraph>
      );
    }

    return trackerKey === '' ? renderTrackerSeriesList() : renderTrackEntry();
  };

  useEffect(() => {
    if (trackerKey !== '') {
      setTrackEntry(undefined);
      setLoading(true);

      ipcRenderer
        .invoke(
          ipcChannels.TRACKER.GET_LIBRARY_ENTRY,
          AniListTrackerMetadata.id,
          trackerKey
        )
        .then((libraryEntry: TrackEntry) =>
          setTrackEntry(
            libraryEntry !== null
              ? libraryEntry
              : {
                  seriesId: trackerKey,
                  progress: 0,
                  status: TrackStatus.Reading,
                }
          )
        )
        .catch((e) => log.error(e))
        .finally(() => setLoading(false))
        .catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackerKey]);

  useEffect(() => {
    setTrackerKey('');
    setTrackerSeriesList([]);

    if (props.visible) {
      ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_USERNAME, AniListTrackerMetadata.id)
        .then((username: string | null) => {
          const isAuth = username !== null;
          setAuthenticated(isAuth);
          return isAuth;
        })
        .then((isAuth: boolean) => {
          // eslint-disable-next-line promise/always-return
          if (isAuth) {
            if (
              props.series.trackerKeys &&
              Object.keys(props.series.trackerKeys).includes(
                AniListTrackerMetadata.id
              )
            ) {
              const key = props.series.trackerKeys[AniListTrackerMetadata.id];
              setTrackerKey(key);
              if (key === '') loadTrackerSeriesList();
            } else {
              loadTrackerSeriesList();
            }
          } else {
            setLoading(false);
          }
        })
        .catch((e) => log.error(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.series, props.visible]);

  if (loading) {
    return (
      <Modal
        title="Trackers"
        visible={props.visible}
        footer={null}
        onCancel={props.toggleVisible}
      >
        <div className={styles.loaderContainer}>
          <Spin />
          <Paragraph>Loading tracker details...</Paragraph>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Trackers"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <Tabs defaultActiveKey="1" tabPosition="top" className={styles.tabs}>
        <TabPane tab="AniList" key={1}>
          {renderTrackerContent()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default SeriesTrackerModal;
