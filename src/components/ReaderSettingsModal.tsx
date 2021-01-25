import React from 'react';
import { Button, Col, Dropdown, Menu, Modal, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ReaderSetting } from '../models/types';
import styles from './ReaderSettingsModal.css';

type Props = {
  visible: boolean;
  toggleVisible: () => void;
  saveSetting: (key: ReaderSetting, value: any) => void;
};

const ReaderSettingsModal: React.FC<Props> = (props: Props) => {
  const preloadMenu = (
    <Menu onChange={(e) => alert(e)}>
      <Menu.Item key="0">Disabled</Menu.Item>
      <Menu.Item key="1">1 Page</Menu.Item>
      <Menu.Item key="2">2 Pages</Menu.Item>
      <Menu.Item key="3">3 Pages</Menu.Item>
      <Menu.Item key="4">4 Pages</Menu.Item>
      <Menu.Item key="5">5 Pages</Menu.Item>
      <Menu.Item key="∞">Infinite</Menu.Item>
    </Menu>
  );

  return (
    <Modal
      title="Reader Settings"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <Row className={styles.settingRow}>
        <Col span={16}>Image Preloading</Col>
        <Col span={8}>
          <Dropdown overlay={preloadMenu}>
            <Button>
              Button <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.settingRow}>
        <Col span={16}>Image Preloading</Col>
        <Col span={8}>
          <Dropdown overlay={preloadMenu}>
            <Button>
              Button <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <p>something in the modal</p>
    </Modal>
  );
};

export default ReaderSettingsModal;
