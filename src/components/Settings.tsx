import React from 'react';
import { Select, Col, Input, Row, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';
import styles from './Settings.css';
import { Languages } from '../models/languages';
import {
  Language,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../models/types';
import {
  DEFAULT_READER_SETTINGS,
  getStoredReaderSettings,
  saveReaderSetting,
} from '../util/settings';

const { Option } = Select;

type Props = {};

const languageOptions = Object.values(Languages).map((language: Language) => (
  <Option key={language.key} value={language.key}>
    {language.name}
  </Option>
));

const layoutDirectionText: { [key in LayoutDirection]: string } = {
  [LayoutDirection.LeftToRight]: 'Left-to-Right',
  [LayoutDirection.RightToLeft]: 'Right-to-Left',
};

const pageViewText: { [key in PageView]: string } = {
  [PageView.Single]: 'Single',
  [PageView.Double]: 'Double (Even Start)',
  [PageView.Double_OddStart]: 'Double (Odd Start)',
};

const pageFitText: { [key in PageFit]: string } = {
  [PageFit.Auto]: 'Auto',
  [PageFit.Width]: 'Fit Width',
  [PageFit.Height]: 'Fit Height',
};

const preloadText: { [key: number]: string } = {
  0: 'Disabled',
  1: '1 Page',
  2: '2 Pages',
  3: '3 Pages',
  4: '4 Pages',
  5: '5 Pages',
};

const Settings: React.FC<Props> = (props: Props) => {
  const settings: { [key in ReaderSetting]?: any } = getStoredReaderSettings();

  let layoutDirection: LayoutDirection =
    settings[ReaderSetting.LayoutDirection];
  let pageView: PageView = settings[ReaderSetting.PageView];
  let pageFit: PageFit = settings[ReaderSetting.PageFit];
  let preloadAmount: number = settings[ReaderSetting.PreloadAmount];

  if (layoutDirection === undefined)
    layoutDirection = DEFAULT_READER_SETTINGS[ReaderSetting.LayoutDirection];
  if (pageView === undefined)
    pageView = DEFAULT_READER_SETTINGS[ReaderSetting.PageView];
  if (pageFit === undefined)
    pageFit = DEFAULT_READER_SETTINGS[ReaderSetting.PageFit];
  if (preloadAmount === undefined)
    preloadAmount = DEFAULT_READER_SETTINGS[ReaderSetting.PreloadAmount];

  const renderMenuItems = (textMap: { [key: number]: string }) => {
    return (
      <>
        {Object.entries(textMap).map((entry) => {
          return (
            <Menu.Item key={entry[0]} data-value={entry[0]}>
              {entry[1]}
            </Menu.Item>
          );
        })}
      </>
    );
  };

  const renderMenu = (
    readerSetting: ReaderSetting,
    textMap: { [key: number]: string }
  ) => {
    return (
      <Menu
        onClick={(e) =>
          saveReaderSetting(
            readerSetting,
            parseInt(e.item.props['data-value'], 10)
          )
        }
      >
        {renderMenuItems(textMap)}
      </Menu>
    );
  };

  return (
    <>
      <Title level={3}>General</Title>
      <Row className={styles.row}>
        <Col span={10}>Languages in Chapter List</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Select languages..."
          >
            {languageOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Author(s)</Col>
        <Col span={14}>
          <Input />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Artist(s)</Col>
        <Col span={14}>
          <Input />
        </Col>
      </Row>
      <Title level={3}>Reader</Title>
      <Row className={styles.row}>
        <Col span={10}>Layout Direction</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(
              ReaderSetting.LayoutDirection,
              layoutDirectionText
            )}
          >
            <Button>
              {layoutDirectionText[layoutDirection]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Page View</Col>
        <Col span={14}>
          <Dropdown overlay={renderMenu(ReaderSetting.PageView, pageViewText)}>
            <Button>
              {pageViewText[pageView]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Page Fit</Col>
        <Col span={14}>
          <Dropdown overlay={renderMenu(ReaderSetting.PageFit, pageFitText)}>
            <Button>
              {pageFitText[pageFit]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Image Preloading</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(ReaderSetting.PreloadAmount, preloadText)}
          >
            <Button>
              {preloadText[preloadAmount]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </>
  );
};

export default Settings;
