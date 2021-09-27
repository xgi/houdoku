/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  Row,
  Spin,
  Collapse,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { connect, ConnectedProps } from 'react-redux';
import styles from './TrackerSettings.css';
import ipcChannels from '../../constants/ipcChannels.json';
import storeKeys from '../../constants/storeKeys.json';
import persistantStore from '../../util/persistantStore';
import { AniListTrackerMetadata } from '../../services/trackers/anilist';
import { TrackerSetting } from '../../models/types';
import { setTrackerAutoUpdate } from '../../features/settings/actions';
import { RootState } from '../../store';
import { MALTrackerMetadata } from '../../services/trackers/myanimelist';

const { Panel } = Collapse;

const mapState = (state: RootState) => ({
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setTrackerAutoUpdate: (trackerAutoUpdate: boolean) =>
    dispatch(setTrackerAutoUpdate(trackerAutoUpdate)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const TrackerSettings: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [accessCodes, setAccessCodes] = useState<{
    [trackerId: string]: string;
  }>({});
  const [authUrls, setAuthUrls] = useState<{ [trackerId: string]: string }>({});
  const [usernames, setUsernames] = useState<{
    [trackerId: string]: string | null;
  }>({});

  const updateTrackerSetting = (trackerSetting: TrackerSetting, value: any) => {
    switch (trackerSetting) {
      case TrackerSetting.TrackerAutoUpdate:
        props.setTrackerAutoUpdate(value);
        break;
      default:
        break;
    }
  };

  const getUsername = (trackerId: string): Promise<string | null> => {
    return ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_USERNAME, trackerId)
      .catch((e) => log.error(e));
  };

  const loadTrackerDetails = async () => {
    setLoading(true);

    setAuthUrls(
      await ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_AUTH_URLS)
        .catch((e) => log.error(e))
    );

    setUsernames({
      [AniListTrackerMetadata.id]: await getUsername(AniListTrackerMetadata.id),
      [MALTrackerMetadata.id]: await getUsername(MALTrackerMetadata.id),
    });

    setLoading(false);
  };

  const saveAccessToken = async (trackerId: string, accessToken: string) => {
    setLoading(true);

    persistantStore.write(
      `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${trackerId}`,
      accessToken
    );
    await ipcRenderer
      .invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, trackerId, accessToken)
      .catch((e) => log.error(e));

    loadTrackerDetails();
  };

  const submitAccessCode = async (trackerId: string, accessCode: string) => {
    setLoading(true);

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, trackerId, accessCode)
      .then((token: string | null) => saveAccessToken(trackerId, token || ''))
      .catch((e) => log.error(e));
  };

  useEffect(() => {
    loadTrackerDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Spin />
        <Paragraph>Reloading tracker details</Paragraph>
      </div>
    );
  }

  return (
    <>
      <Alert
        className={styles.infoAlert}
        type="info"
        message='Houdoku allows you to sync your account on list-tracking websites and
        automatically upload your progress as you read. After authenticating
        below, click the "Trackers" button on a series page to link it
        with an entry on your list.'
      />
      <Row className={styles.row}>
        <Col span={10}>Update Progress Automatically</Col>
        <Col span={14}>
          <Dropdown
            overlay={
              <Menu
                onClick={(e: any) => {
                  updateTrackerSetting(
                    TrackerSetting.TrackerAutoUpdate,
                    e.item.props['data-value'] === 'true'
                  );
                }}
              >
                <Menu.Item key={1} data-value="true">
                  Yes
                </Menu.Item>
                <Menu.Item key={2} data-value="false">
                  No
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.trackerAutoUpdate ? 'Yes' : 'No'}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Collapse>
        {[AniListTrackerMetadata, MALTrackerMetadata].map((trackerMetadata) => (
          <Panel header={trackerMetadata.name} key={trackerMetadata.id}>
            <Row className={styles.step}>
              <Col span={6}>
                1) Open the authentication page in your browser
              </Col>
              <Col span={2} />
              <Col span={16}>
                <Paragraph>
                  <a
                    href={authUrls[trackerMetadata.id]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {authUrls[trackerMetadata.id]}
                  </a>
                </Paragraph>
              </Col>
            </Row>
            <Row className={styles.step}>
              <Col span={6}>2) Copy the token you receive</Col>
              <Col span={2} />
              <Col span={16}>
                <Input
                  value={accessCodes[trackerMetadata.id]}
                  onChange={(e: any) =>
                    setAccessCodes({
                      ...accessCodes,
                      [trackerMetadata.id]: e.target.value,
                    })
                  }
                />
              </Col>
            </Row>
            <Row className={styles.step}>
              <Col span={6}>3) Save details</Col>
              <Col span={2} />
              <Col span={16}>
                <Button
                  onClick={() =>
                    submitAccessCode(
                      trackerMetadata.id,
                      accessCodes[trackerMetadata.id]
                    )
                  }
                >
                  Submit
                </Button>
              </Col>
            </Row>

            {usernames[trackerMetadata.id] ? (
              <Paragraph className={styles.statusText}>
                Authenticated as {usernames[trackerMetadata.id]}.{' '}
                <a onClick={() => saveAccessToken(trackerMetadata.id, '')}>
                  Unlink
                </a>
                .
              </Paragraph>
            ) : (
              <Paragraph className={styles.statusText}>
                You are not currently authenticated.
              </Paragraph>
            )}
          </Panel>
        ))}
      </Collapse>
    </>
  );
};

export default connector(TrackerSettings);
