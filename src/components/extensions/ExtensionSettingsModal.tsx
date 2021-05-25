import React, { useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Spin, Switch } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import styles from './ExtensionSettingsModal.css';
import ipcChannels from '../../constants/ipcChannels.json';
import persistantStore from '../../util/persistantStore';

type Props = {
  visible: boolean;
  toggleVisible: () => void;
  extensionId: string;
};

const ExtensionSettingsModal: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [extensionSettings, setExtensionSettings] = useState<{
    [key: string]: any;
  }>({});

  const loadExtensionSettings = async () => {
    setLoading(true);
    setExtensionSettings({});
    log.debug(
      `Extension settings modal loading client for ${extensionSettings}`
    );

    setExtensionSettings(
      await ipcRenderer.invoke(
        ipcChannels.EXTENSION.GET_SETTINGS,
        props.extensionId
      )
    );
    setLoading(false);
  };

  const saveExtensionSettings = async () => {
    await ipcRenderer.invoke(
      ipcChannels.EXTENSION.SET_SETTINGS,
      props.extensionId,
      extensionSettings
    );
    persistantStore.write(
      `extension-settings-${props.extensionId}`,
      JSON.stringify(extensionSettings)
    );
    props.toggleVisible();
  };

  const renderControl = (curVal: any, onChangeFn: (newValue: any) => void) => {
    if (typeof curVal === 'boolean') {
      return (
        <Switch
          defaultChecked={curVal}
          onChange={(e: boolean) => onChangeFn(e)}
        />
      );
    }
    return <Paragraph>(no control for this setting)</Paragraph>;
  };

  const renderRows = () => {
    return Object.keys(extensionSettings).map((key: string) => {
      return (
        <Row key={key} className={styles.row}>
          <Col span={14}>{key}</Col>
          <Col span={10}>
            {renderControl(extensionSettings[key], (newValue: any) =>
              setExtensionSettings({ ...extensionSettings, [key]: newValue })
            )}
          </Col>
        </Row>
      );
    });
  };

  useEffect(() => {
    if (props.visible && props.extensionId !== '') {
      loadExtensionSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.visible, props.extensionId]);

  if (loading) {
    return (
      <Modal
        title="Extension Settings"
        visible={props.visible}
        footer={null}
        onCancel={props.toggleVisible}
      >
        <div className={styles.loaderContainer}>
          <Spin />
          <Paragraph>Loading settings for this extension...</Paragraph>
        </div>
      </Modal>
    );
  }

  if (Object.keys(extensionSettings).length === 0) {
    return (
      <Modal
        title="Extension Settings"
        visible={props.visible}
        footer={null}
        onCancel={props.toggleVisible}
      >
        <Paragraph>This extension does not provide any settings.</Paragraph>
      </Modal>
    );
  }

  return (
    <Modal
      title="Extension Settings"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      {renderRows()}
      <Row className={styles.buttonRow}>
        <Button className={styles.button} onClick={props.toggleVisible}>
          Cancel
        </Button>
        <Button
          className={styles.button}
          type="primary"
          onClick={saveExtensionSettings}
        >
          Save Settings
        </Button>
      </Row>
    </Modal>
  );
};

export default ExtensionSettingsModal;
