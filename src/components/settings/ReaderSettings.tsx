import React, { useState } from 'react';
import { Col, Row, Menu, Dropdown, Button, Modal, Tooltip, Switch } from 'antd';
import { DownOutlined, UndoOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import styles from './ReaderSettings.css';
import { ReadingDirection, PageStyle, ReaderSetting } from '../../models/types';
import { RootState } from '../../store';
import {
  setFitContainToHeight,
  setFitContainToWidth,
  setFitStretch,
  setHideScrollbar,
  setKeybinding,
  setOverlayPageNumber,
  setPageStyle,
  setPreloadAmount,
  setReadingDirection,
} from '../../features/settings/actions';
import { DEFAULT_READER_SETTINGS } from '../../features/settings/utils';

const readingDirectionText: { [key in ReadingDirection]: string } = {
  [ReadingDirection.LeftToRight]: 'Left-to-Right',
  [ReadingDirection.RightToLeft]: 'Right-to-Left',
};
const pageStyleText: { [key in PageStyle]: string } = {
  [PageStyle.Single]: 'Single',
  [PageStyle.Double]: 'Double',
  [PageStyle.LongStrip]: 'Long Strip',
};
const preloadText: { [key: number]: string } = {
  0: 'Disabled',
  1: '1 Page',
  2: '2 Pages',
  3: '3 Pages',
  4: '4 Pages',
  5: '5 Pages',
};

const mapState = (state: RootState) => ({
  fitContainToWidth: state.settings.fitContainToWidth,
  fitContainToHeight: state.settings.fitContainToHeight,
  fitStretch: state.settings.fitStretch,
  pageStyle: state.settings.pageStyle,
  readingDirection: state.settings.readingDirection,
  preloadAmount: state.settings.preloadAmount,
  overlayPageNumber: state.settings.overlayPageNumber,
  hideScrollbar: state.settings.hideScrollbar,
  keyPreviousPage: state.settings.keyPreviousPage,
  keyFirstPage: state.settings.keyFirstPage,
  keyNextPage: state.settings.keyNextPage,
  keyLastPage: state.settings.keyLastPage,
  keyScrollUp: state.settings.keyScrollUp,
  keyScrollDown: state.settings.keyScrollDown,
  keyPreviousChapter: state.settings.keyPreviousChapter,
  keyNextChapter: state.settings.keyNextChapter,
  keyToggleReadingDirection: state.settings.keyToggleReadingDirection,
  keyTogglePageStyle: state.settings.keyTogglePageStyle,
  keyToggleShowingSettingsModal: state.settings.keyToggleShowingSettingsModal,
  keyToggleShowingSidebar: state.settings.keyToggleShowingSidebar,
  keyExit: state.settings.keyExit,
  keyCloseOrBack: state.settings.keyCloseOrBack,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setFitContainToWidth: (value: boolean) =>
    dispatch(setFitContainToWidth(value)),
  setFitContainToHeight: (value: boolean) =>
    dispatch(setFitContainToHeight(value)),
  setFitStretch: (value: boolean) => dispatch(setFitStretch(value)),
  setPageStyle: (value: PageStyle) => dispatch(setPageStyle(value)),
  setReadingDirection: (value: ReadingDirection) =>
    dispatch(setReadingDirection(value)),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  setOverlayPageNumber: (overlayPageNumber: boolean) =>
    dispatch(setOverlayPageNumber(overlayPageNumber)),
  setHideScrollbar: (hideScrollbar: boolean) =>
    dispatch(setHideScrollbar(hideScrollbar)),
  setKeybinding: (keySetting: ReaderSetting, value: string) =>
    dispatch(setKeybinding(keySetting, value)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderSettings: React.FC<Props> = (props: Props) => {
  const [showingResetKeybindsModal, setShowingKeybindsModal] = useState(false);

  const updateReaderSetting = (readerSetting: ReaderSetting, value: any) => {
    switch (readerSetting) {
      case ReaderSetting.ReadingDirection:
        props.setReadingDirection(value);
        break;
      case ReaderSetting.FitContainToWidth:
        props.setFitContainToWidth(value);
        break;
      case ReaderSetting.FitContainToHeight:
        props.setFitContainToHeight(value);
        break;
      case ReaderSetting.FitStretch:
        props.setFitStretch(value);
        break;
      case ReaderSetting.PageStyle:
        props.setPageStyle(value);
        break;
      case ReaderSetting.PreloadAmount:
        props.setPreloadAmount(value);
        break;
      case ReaderSetting.OverlayPageNumber:
        props.setOverlayPageNumber(value);
        break;
      case ReaderSetting.HideScrollbar:
        props.setHideScrollbar(value);
        break;
      case ReaderSetting.KeyPreviousPage:
      case ReaderSetting.KeyFirstPage:
      case ReaderSetting.KeyNextPage:
      case ReaderSetting.KeyLastPage:
      case ReaderSetting.KeyScrollUp:
      case ReaderSetting.KeyScrollDown:
      case ReaderSetting.KeyPreviousChapter:
      case ReaderSetting.KeyNextChapter:
      case ReaderSetting.KeyToggleReadingDirection:
      case ReaderSetting.KeyTogglePageStyle:
      case ReaderSetting.KeyToggleShowingSettingsModal:
      case ReaderSetting.KeyToggleShowingSidebar:
      case ReaderSetting.KeyExit:
      case ReaderSetting.KeyCloseOrBack:
        props.setKeybinding(readerSetting, value);
        break;
      default:
        break;
    }
  };

  const updateKeySetting = (
    e: React.KeyboardEvent,
    readerSetting: ReaderSetting
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !['Control', 'Shift', 'Meta', 'Command', 'Alt', 'Option'].includes(e.key)
    ) {
      const metaStr = `${e.metaKey ? 'meta+' : ''}`;
      const ctrlStr = `${e.ctrlKey ? 'ctrl+' : ''}`;
      const altStr = `${e.altKey ? 'alt+' : ''}`;
      const shiftStr = `${e.shiftKey ? 'shift+' : ''}`;

      const key = e.key
        .toLowerCase()
        .replace('arrow', '')
        .replace('insert', 'ins')
        .replace('delete', 'del')
        .replace(' ', 'space')
        .replace('+', 'plus');

      const keyStr = `${metaStr}${ctrlStr}${altStr}${shiftStr}${key}`;
      updateReaderSetting(readerSetting, keyStr);
    }
  };

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
        onClick={(e: any) => {
          updateReaderSetting(
            readerSetting,
            parseInt(e.item.props['data-value'], 10)
          );
        }}
      >
        {renderMenuItems(textMap)}
      </Menu>
    );
  };

  return (
    <>
      <Modal
        visible={showingResetKeybindsModal}
        title="Reset all keyboard shortcuts to the default?"
        onCancel={() => setShowingKeybindsModal(false)}
        okText="Reset"
        okButtonProps={{ danger: true }}
        onOk={() => {
          Object.values(ReaderSetting).forEach((readerSetting) =>
            updateReaderSetting(
              readerSetting,
              DEFAULT_READER_SETTINGS[readerSetting]
            )
          );
          setShowingKeybindsModal(false);
        }}
      >
        <Paragraph>
          This will overwrite your current keyboard shortcuts.
        </Paragraph>
      </Modal>
      <Row className={styles.row}>
        <Col span={10}>Reading Direction</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(
              ReaderSetting.ReadingDirection,
              readingDirectionText
            )}
          >
            <Button>
              {readingDirectionText[props.readingDirection]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Page Style</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(ReaderSetting.PageStyle, pageStyleText)}
          >
            <Button>
              {pageStyleText[props.pageStyle]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Fit: Contain to Width</Col>
        <Col span={14}>
          <Switch
            checked={props.fitContainToWidth}
            onChange={(checked: boolean) =>
              updateReaderSetting(ReaderSetting.FitContainToWidth, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Fit: Contain to Height</Col>
        <Col span={14}>
          <Switch
            checked={props.fitContainToHeight}
            onChange={(checked: boolean) =>
              updateReaderSetting(ReaderSetting.FitContainToHeight, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Fit: Stretch Pages</Col>
        <Col span={14}>
          <Switch
            checked={props.fitStretch}
            onChange={(checked: boolean) =>
              updateReaderSetting(ReaderSetting.FitStretch, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Image Preloading</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(ReaderSetting.PreloadAmount, preloadText)}
          >
            <Button>
              {preloadText[props.preloadAmount]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Overlay Page Number</Col>
        <Col span={14}>
          <Switch
            checked={props.overlayPageNumber}
            onChange={(checked: boolean) =>
              updateReaderSetting(ReaderSetting.OverlayPageNumber, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Hide Scrollbar</Col>
        <Col span={14}>
          <Switch
            checked={props.hideScrollbar}
            onChange={(checked: boolean) =>
              updateReaderSetting(ReaderSetting.HideScrollbar, checked)
            }
          />
        </Col>
      </Row>
      <Title level={4} className={styles.heading}>
        Keyboard Shortcuts
      </Title>

      <Button
        className={styles.resetAllButton}
        onClick={() => setShowingKeybindsModal(true)}
      >
        Reset All Shortcuts
      </Button>

      {[
        {
          name: 'Next Page',
          value: props.keyNextPage,
          setting: ReaderSetting.KeyNextPage,
        },
        {
          name: 'Previous Page',
          value: props.keyPreviousPage,
          setting: ReaderSetting.KeyPreviousPage,
        },
        {
          name: 'First Page',
          value: props.keyFirstPage,
          setting: ReaderSetting.KeyFirstPage,
        },
        {
          name: 'Last Page',
          value: props.keyLastPage,
          setting: ReaderSetting.KeyLastPage,
        },
        {
          name: 'Scroll Up',
          value: props.keyScrollUp,
          setting: ReaderSetting.KeyScrollUp,
        },
        {
          name: 'Scroll Down',
          value: props.keyScrollDown,
          setting: ReaderSetting.KeyScrollDown,
        },
        {
          name: 'Next Chapter',
          value: props.keyNextChapter,
          setting: ReaderSetting.KeyNextChapter,
        },
        {
          name: 'Previous Chapter',
          value: props.keyPreviousChapter,
          setting: ReaderSetting.KeyPreviousChapter,
        },
        {
          name: 'Exit Reader',
          value: props.keyExit,
          setting: ReaderSetting.KeyExit,
        },
        {
          name: 'Close/Back',
          value: props.keyCloseOrBack,
          setting: ReaderSetting.KeyCloseOrBack,
        },
        {
          name: 'Toggle Sidebar',
          value: props.keyToggleShowingSidebar,
          setting: ReaderSetting.KeyToggleShowingSidebar,
        },
        {
          name: 'Toggle Reading Direction',
          value: props.keyToggleReadingDirection,
          setting: ReaderSetting.KeyToggleReadingDirection,
        },
        {
          name: 'Toggle Page Style',
          value: props.keyTogglePageStyle,
          setting: ReaderSetting.KeyTogglePageStyle,
        },
        {
          name: 'Show Settings Menu',
          value: props.keyToggleShowingSettingsModal,
          setting: ReaderSetting.KeyToggleShowingSettingsModal,
        },
      ].map((entry) => (
        <Row className={styles.row} key={entry.setting}>
          <Col span={10}>{entry.name}</Col>
          <Col span={14}>
            <Button
              className={styles.shortcutButton}
              onKeyDownCapture={(e) => updateKeySetting(e, entry.setting)}
            >
              {entry.value}
            </Button>
            <Tooltip title="Reset">
              <Button
                className={styles.shortcutResetButton}
                icon={<UndoOutlined />}
                onClick={() =>
                  updateReaderSetting(
                    entry.setting,
                    DEFAULT_READER_SETTINGS[entry.setting]
                  )
                }
              />
            </Tooltip>
          </Col>
        </Row>
      ))}
    </>
  );
};

export default connector(ReaderSettings);
