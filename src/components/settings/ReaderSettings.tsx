import React, { useState } from 'react';
import { Row, Menu, Button, Modal, Tooltip, Checkbox, Collapse } from 'antd';
import {
  UndoOutlined,
  FileOutlined,
  ReadOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
} from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import Paragraph from 'antd/lib/typography/Paragraph';
import styles from './ReaderSettings.css';
import {
  ReadingDirection,
  PageStyle,
  ReaderSetting,
  DefaultSettings,
} from '../../models/types';
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

const { Panel } = Collapse;

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
  keyPreviousChapter: state.settings.keyPreviousChapter,
  keyNextChapter: state.settings.keyNextChapter,
  keyToggleReadingDirection: state.settings.keyToggleReadingDirection,
  keyTogglePageStyle: state.settings.keyTogglePageStyle,
  keyToggleShowingSettingsModal: state.settings.keyToggleShowingSettingsModal,
  keyToggleShowingSidebar: state.settings.keyToggleShowingSidebar,
  keyToggleShowingHeader: state.settings.keyToggleShowingHeader,
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
      case ReaderSetting.KeyPreviousChapter:
      case ReaderSetting.KeyNextChapter:
      case ReaderSetting.KeyToggleReadingDirection:
      case ReaderSetting.KeyTogglePageStyle:
      case ReaderSetting.KeyToggleShowingSettingsModal:
      case ReaderSetting.KeyToggleShowingSidebar:
      case ReaderSetting.KeyToggleShowingHeader:
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
            updateReaderSetting(readerSetting, DefaultSettings[readerSetting])
          );
          setShowingKeybindsModal(false);
        }}
      >
        <Paragraph>
          This will overwrite your current keyboard shortcuts.
        </Paragraph>
      </Modal>
      <Paragraph className={styles.settingName}>Page Style</Paragraph>
      <Row className={styles.row}>
        <div className={styles.toggleContainer}>
          <Button
            icon={<FileOutlined />}
            className={`
              ${styles.toggleButton}
              ${props.pageStyle === PageStyle.Single ? styles.active : ''}
            `}
            onClick={() =>
              updateReaderSetting(ReaderSetting.PageStyle, PageStyle.Single)
            }
          >
            Single
          </Button>
          <Button
            icon={<ReadOutlined />}
            className={`
              ${styles.toggleButton}
              ${props.pageStyle === PageStyle.Double ? styles.active : ''}
            `}
            onClick={() =>
              updateReaderSetting(ReaderSetting.PageStyle, PageStyle.Double)
            }
          >
            Double
          </Button>
          <Button
            icon={<DownSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${props.pageStyle === PageStyle.LongStrip ? styles.active : ''}
            `}
            onClick={() =>
              updateReaderSetting(ReaderSetting.PageStyle, PageStyle.LongStrip)
            }
          >
            Long Strip
          </Button>
        </div>
      </Row>
      <Paragraph className={styles.settingName}>Reading Direction</Paragraph>
      <Row className={styles.row}>
        <div className={styles.toggleContainer}>
          <Button
            icon={<RightSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${
                props.readingDirection === ReadingDirection.LeftToRight
                  ? styles.active
                  : ''
              }
            `}
            onClick={() =>
              updateReaderSetting(
                ReaderSetting.ReadingDirection,
                ReadingDirection.LeftToRight
              )
            }
          >
            Left-to-Right
          </Button>
          <Button
            icon={<LeftSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${
                props.readingDirection === ReadingDirection.RightToLeft
                  ? styles.active
                  : ''
              }
            `}
            onClick={() =>
              updateReaderSetting(
                ReaderSetting.ReadingDirection,
                ReadingDirection.RightToLeft
              )
            }
          >
            Right-to-Left
          </Button>
        </div>
      </Row>
      <Paragraph className={styles.settingName}>Image Sizing</Paragraph>
      <Row className={styles.row}>
        <div>
          <Checkbox
            className={styles.checkbox}
            checked={props.fitContainToWidth}
            onClick={() =>
              updateReaderSetting(
                ReaderSetting.FitContainToWidth,
                !props.fitContainToWidth
              )
            }
          >
            Contain to width
          </Checkbox>
          <br />
          <Checkbox
            className={styles.checkbox}
            checked={props.fitContainToHeight}
            onClick={() =>
              updateReaderSetting(
                ReaderSetting.FitContainToHeight,
                !props.fitContainToHeight
              )
            }
          >
            Contain to height
          </Checkbox>
          <br />
          <Checkbox
            className={styles.checkbox}
            checked={props.fitStretch}
            disabled={!(props.fitContainToHeight || props.fitContainToWidth)}
            onClick={() =>
              updateReaderSetting(ReaderSetting.FitStretch, !props.fitStretch)
            }
          >
            Stretch small pages
          </Checkbox>
        </div>
      </Row>
      <Collapse ghost className={styles.something}>
        <Panel
          className={styles.keybindsPanel}
          header="Keyboard Shortcuts"
          key="1"
        >
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
            {
              name: 'Toggle Menu Bar',
              value: props.keyToggleShowingHeader,
              setting: ReaderSetting.KeyToggleShowingHeader,
            },
          ].map((entry) => (
            <Row className={styles.keybindRow} key={entry.setting}>
              <div className={styles.keybindName}>{entry.name}</div>
              <div>
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
                        DefaultSettings[entry.setting]
                      )
                    }
                  >
                    Reset
                  </Button>
                </Tooltip>
              </div>
            </Row>
          ))}
          <Button
            className={styles.resetAllButton}
            onClick={() => setShowingKeybindsModal(true)}
          >
            Reset All Shortcuts
          </Button>
        </Panel>
      </Collapse>
    </>
  );
};

export default connector(ReaderSettings);
