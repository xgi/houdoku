import React, { useState } from 'react';
import { Row, Button, Modal, Tooltip, Checkbox, Collapse } from 'antd';
import {
  UndoOutlined,
  FileOutlined,
  ReadOutlined,
  DownSquareOutlined,
  LeftSquareOutlined,
  RightSquareOutlined,
} from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useRecoilState } from 'recoil';
import styles from './ReaderSettings.css';
import { ReadingDirection, PageStyle, ReaderSetting, DefaultSettings } from '../../models/types';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
  hideScrollbarState,
  keyCloseOrBackState,
  keyExitState,
  keyFirstPageState,
  keyLastPageState,
  keyNextChapterState,
  keyNextPageState,
  keyPreviousChapterState,
  keyPreviousPageState,
  keyTogglePageStyleState,
  keyToggleReadingDirectionState,
  keyToggleShowingHeaderState,
  keyToggleShowingSettingsModalState,
  keyToggleShowingSidebarState,
  overlayPageNumberState,
  pageStyleState,
  preloadAmountState,
  readingDirectionState,
  longStripMarginState,
} from '../../state/settingStates';

const { Panel } = Collapse;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const ReaderSettings: React.FC<Props> = (props: Props) => {
  const [showingResetKeybindsModal, setShowingKeybindsModal] = useState(false);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
  const [preloadAmount, setPreloadAmount] = useRecoilState(preloadAmountState);
  const [overlayPageNumber, setOverlayPageNumber] = useRecoilState(overlayPageNumberState);
  const [hideScrollbar, setHideScrollbar] = useRecoilState(hideScrollbarState);
  const [keyPreviousPage, setKeyPreviousPage] = useRecoilState(keyPreviousPageState);
  const [keyFirstPage, setKeyFirstPage] = useRecoilState(keyFirstPageState);
  const [keyNextPage, setKeyNextPage] = useRecoilState(keyNextPageState);
  const [keyLastPage, setKeyLastPage] = useRecoilState(keyLastPageState);
  const [keyPreviousChapter, setKeyPreviousChapter] = useRecoilState(keyPreviousChapterState);
  const [keyNextChapter, setKeyNextChapter] = useRecoilState(keyNextChapterState);
  const [keyToggleReadingDirection, setKeyToggleReadingDirection] = useRecoilState(
    keyToggleReadingDirectionState
  );
  const [keyTogglePageStyle, setKeyTogglePageStyle] = useRecoilState(keyTogglePageStyleState);
  const [keyToggleShowingSettingsModal, setKeyToggleShowingSettingsModal] = useRecoilState(
    keyToggleShowingSettingsModalState
  );
  const [keyToggleShowingSidebar, setKeyToggleShowingSidebar] = useRecoilState(
    keyToggleShowingSidebarState
  );
  const [keyToggleShowingHeader, setKeyToggleShowingHeader] = useRecoilState(
    keyToggleShowingHeaderState
  );
  const [keyExit, setKeyExit] = useRecoilState(keyExitState);
  const [keyCloseOrBack, setKeyCloseOrBack] = useRecoilState(keyCloseOrBackState);
  const [longStripMargin, setLongStripMargin] = useRecoilState(longStripMarginState);

  const updateReaderSetting = (readerSetting: ReaderSetting, value: any) => {
    switch (readerSetting) {
      case ReaderSetting.ReadingDirection:
        setReadingDirection(value);
        break;
      case ReaderSetting.FitContainToWidth:
        setFitContainToWidth(value);
        break;
      case ReaderSetting.FitContainToHeight:
        setFitContainToHeight(value);
        break;
      case ReaderSetting.FitStretch:
        setFitStretch(value);
        break;
      case ReaderSetting.PageStyle:
        setPageStyle(value);
        break;
      case ReaderSetting.PreloadAmount:
        setPreloadAmount(value);
        break;
      case ReaderSetting.OverlayPageNumber:
        setOverlayPageNumber(value);
        break;
      case ReaderSetting.HideScrollbar:
        setHideScrollbar(value);
        break;
      case ReaderSetting.KeyPreviousPage:
        setKeyPreviousPage(value);
        break;
      case ReaderSetting.KeyFirstPage:
        setKeyFirstPage(value);
        break;
      case ReaderSetting.KeyNextPage:
        setKeyNextPage(value);
        break;
      case ReaderSetting.KeyLastPage:
        setKeyLastPage(value);
        break;
      case ReaderSetting.KeyPreviousChapter:
        setKeyPreviousChapter(value);
        break;
      case ReaderSetting.KeyNextChapter:
        setKeyNextChapter(value);
        break;
      case ReaderSetting.KeyToggleReadingDirection:
        setKeyToggleReadingDirection(value);
        break;
      case ReaderSetting.KeyTogglePageStyle:
        setKeyTogglePageStyle(value);
        break;
      case ReaderSetting.KeyToggleShowingSettingsModal:
        setKeyToggleShowingSettingsModal(value);
        break;
      case ReaderSetting.KeyToggleShowingSidebar:
        setKeyToggleShowingSidebar(value);
        break;
      case ReaderSetting.KeyToggleShowingHeader:
        setKeyToggleShowingHeader(value);
        break;
      case ReaderSetting.KeyExit:
        setKeyExit(value);
        break;
      case ReaderSetting.KeyCloseOrBack:
        setKeyCloseOrBack(value);
        break;
      case ReaderSetting.LongStripMargin:
        setLongStripMargin(value);
        break;
      default:
        break;
    }
  };

  const updateKeySetting = (e: React.KeyboardEvent, readerSetting: ReaderSetting) => {
    e.preventDefault();
    e.stopPropagation();

    if (!['Control', 'Shift', 'Meta', 'Command', 'Alt', 'Option'].includes(e.key)) {
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
        <Paragraph>This will overwrite your current keyboard shortcuts.</Paragraph>
      </Modal>
      <Paragraph className={styles.settingName}>Page Style</Paragraph>
      <Row className={styles.row}>
        <div className={styles.toggleContainer}>
          <Button
            icon={<FileOutlined />}
            className={`
              ${styles.toggleButton}
              ${pageStyle === PageStyle.Single ? styles.active : ''}
            `}
            onClick={() => updateReaderSetting(ReaderSetting.PageStyle, PageStyle.Single)}
          >
            Single
          </Button>
          <Button
            icon={<ReadOutlined />}
            className={`
              ${styles.toggleButton}
              ${pageStyle === PageStyle.Double ? styles.active : ''}
            `}
            onClick={() => updateReaderSetting(ReaderSetting.PageStyle, PageStyle.Double)}
          >
            Double
          </Button>
          <Button
            icon={<DownSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${pageStyle === PageStyle.LongStrip ? styles.active : ''}
            `}
            onClick={() => updateReaderSetting(ReaderSetting.PageStyle, PageStyle.LongStrip)}
          >
            Long Strip
          </Button>
        </div>
      </Row>
      <Row className={styles.row}>
        <div>
          <Checkbox
            className={styles.checkbox}
            checked={longStripMargin}
            disabled={pageStyle !== PageStyle.LongStrip}
            onClick={() => updateReaderSetting(ReaderSetting.LongStripMargin, !longStripMargin)}
          >
            Long Strip Margin
          </Checkbox>
        </div>
      </Row>
      <Paragraph className={styles.settingName}>Reading Direction</Paragraph>
      <Row className={styles.row}>
        <div className={styles.toggleContainer}>
          <Button
            icon={<RightSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${readingDirection === ReadingDirection.LeftToRight ? styles.active : ''}
            `}
            onClick={() =>
              updateReaderSetting(ReaderSetting.ReadingDirection, ReadingDirection.LeftToRight)
            }
          >
            Left-to-Right
          </Button>
          <Button
            icon={<LeftSquareOutlined />}
            className={`
              ${styles.toggleButton}
              ${readingDirection === ReadingDirection.RightToLeft ? styles.active : ''}
            `}
            onClick={() =>
              updateReaderSetting(ReaderSetting.ReadingDirection, ReadingDirection.RightToLeft)
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
            checked={fitContainToWidth}
            onClick={() => updateReaderSetting(ReaderSetting.FitContainToWidth, !fitContainToWidth)}
          >
            Contain to width
          </Checkbox>
          <br />
          <Checkbox
            className={styles.checkbox}
            checked={fitContainToHeight}
            onClick={() =>
              updateReaderSetting(ReaderSetting.FitContainToHeight, !fitContainToHeight)
            }
          >
            Contain to height
          </Checkbox>
          <br />
          <Checkbox
            className={styles.checkbox}
            checked={fitStretch}
            disabled={!(fitContainToHeight || fitContainToWidth)}
            onClick={() => updateReaderSetting(ReaderSetting.FitStretch, !fitStretch)}
          >
            Stretch small pages
          </Checkbox>
        </div>
      </Row>
      <Collapse ghost className={styles.something}>
        <Panel className={styles.keybindsPanel} header="Keyboard Shortcuts" key="1">
          {[
            {
              name: 'Next Page',
              value: keyNextPage,
              setting: ReaderSetting.KeyNextPage,
            },
            {
              name: 'Previous Page',
              value: keyPreviousPage,
              setting: ReaderSetting.KeyPreviousPage,
            },
            {
              name: 'First Page',
              value: keyFirstPage,
              setting: ReaderSetting.KeyFirstPage,
            },
            {
              name: 'Last Page',
              value: keyLastPage,
              setting: ReaderSetting.KeyLastPage,
            },
            {
              name: 'Next Chapter',
              value: keyNextChapter,
              setting: ReaderSetting.KeyNextChapter,
            },
            {
              name: 'Previous Chapter',
              value: keyPreviousChapter,
              setting: ReaderSetting.KeyPreviousChapter,
            },
            {
              name: 'Exit Reader',
              value: keyExit,
              setting: ReaderSetting.KeyExit,
            },
            {
              name: 'Close/Back',
              value: keyCloseOrBack,
              setting: ReaderSetting.KeyCloseOrBack,
            },
            {
              name: 'Toggle Reading Direction',
              value: keyToggleReadingDirection,
              setting: ReaderSetting.KeyToggleReadingDirection,
            },
            {
              name: 'Toggle Page Style',
              value: keyTogglePageStyle,
              setting: ReaderSetting.KeyTogglePageStyle,
            },
            {
              name: 'Show Settings Menu',
              value: keyToggleShowingSettingsModal,
              setting: ReaderSetting.KeyToggleShowingSettingsModal,
            },
            {
              name: 'Toggle Menu Bar',
              value: keyToggleShowingHeader,
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
                      updateReaderSetting(entry.setting, DefaultSettings[entry.setting])
                    }
                  >
                    Reset
                  </Button>
                </Tooltip>
              </div>
            </Row>
          ))}
          <Button className={styles.resetAllButton} onClick={() => setShowingKeybindsModal(true)}>
            Reset All Shortcuts
          </Button>
        </Panel>
      </Collapse>
    </>
  );
};

export default ReaderSettings;
