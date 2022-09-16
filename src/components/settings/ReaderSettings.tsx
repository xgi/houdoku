import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  Table,
  Text,
  SegmentedControl,
  Center,
  Box,
  Checkbox,
  Button,
  Collapse,
  Group,
} from '@mantine/core';
import {
  IconArrowBigLeft,
  IconArrowBigRight,
  IconBook,
  IconFile,
  IconSpacingVertical,
} from '@tabler/icons';
import { ReadingDirection, PageStyle, ReaderSetting, DefaultSettings } from '../../models/types';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
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
  pageStyleState,
  readingDirectionState,
  longStripMarginState,
  offsetDoubleSpreadsState,
  optimizeContrastState,
  keyToggleOffsetDoubleSpreadsState,
} from '../../state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const ReaderSettings: React.FC<Props> = (props: Props) => {
  const [showingKeybinds, setShowingKeybinds] = useState(false);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
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
  const [keyToggleOffsetDoubleSpreads, setKeyToggleOffsetDoubleSpreads] = useRecoilState(
    keyToggleOffsetDoubleSpreadsState
  );
  const [keyToggleShowingSettingsModal, setKeyToggleShowingSettingsModal] = useRecoilState(
    keyToggleShowingSettingsModalState
  );
  const [keyToggleShowingHeader, setKeyToggleShowingHeader] = useRecoilState(
    keyToggleShowingHeaderState
  );
  const [keyExit, setKeyExit] = useRecoilState(keyExitState);
  const [keyCloseOrBack, setKeyCloseOrBack] = useRecoilState(keyCloseOrBackState);
  const [longStripMargin, setLongStripMargin] = useRecoilState(longStripMarginState);
  const [offsetDoubleSpreads, setOffsetDoubleSpreads] = useRecoilState(offsetDoubleSpreadsState);
  const [optimizeContrast, setOptimizeContrast] = useRecoilState(optimizeContrastState);

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
      case ReaderSetting.KeyToggleOffsetDoubleSpreads:
        setKeyToggleOffsetDoubleSpreads(value);
        break;
      case ReaderSetting.KeyToggleShowingSettingsModal:
        setKeyToggleShowingSettingsModal(value);
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
      case ReaderSetting.OffsetDoubleSpreads:
        setOffsetDoubleSpreads(value);
        break;
      case ReaderSetting.OptimizeContrast:
        setOptimizeContrast(value);
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
      <Text>Page Style</Text>
      <SegmentedControl
        mb="xs"
        data={[
          {
            value: PageStyle.Single,
            label: (
              <Center>
                <IconFile size={16} />
                <Box ml={10}>Single</Box>
              </Center>
            ),
          },
          {
            value: PageStyle.Double,
            label: (
              <Center>
                <IconBook size={16} />
                <Box ml={10}>Double</Box>
              </Center>
            ),
          },
          {
            value: PageStyle.LongStrip,
            label: (
              <Center>
                <IconSpacingVertical size={16} />
                <Box ml={10}>Long Strip</Box>
              </Center>
            ),
          },
        ]}
        value={pageStyle}
        onChange={(value) => updateReaderSetting(ReaderSetting.PageStyle, value)}
      />

      <Checkbox
        label="Long strip margin"
        ml="sm"
        pb="xs"
        disabled={pageStyle !== PageStyle.LongStrip}
        checked={longStripMargin}
        onChange={(e) => updateReaderSetting(ReaderSetting.LongStripMargin, e.target.checked)}
      />
      <Checkbox
        label="Offset double spreads"
        ml="sm"
        disabled={pageStyle !== PageStyle.Double}
        checked={offsetDoubleSpreads}
        onChange={(e) => updateReaderSetting(ReaderSetting.OffsetDoubleSpreads, e.target.checked)}
      />

      <Text pt="sm">Reading Direction</Text>
      <SegmentedControl
        data={[
          {
            value: ReadingDirection.LeftToRight,
            label: (
              <Center>
                <IconArrowBigRight size={16} />
                <Box ml={10}>Left-to-Right</Box>
              </Center>
            ),
          },
          {
            value: ReadingDirection.RightToLeft,
            label: (
              <Center>
                <IconArrowBigLeft size={16} />
                <Box ml={10}>Right-to-Left</Box>
              </Center>
            ),
          },
        ]}
        value={readingDirection}
        onChange={(value) => updateReaderSetting(ReaderSetting.ReadingDirection, value)}
      />

      <Text pb="xs">Image Sizing</Text>
      <Checkbox
        label="Contain to width"
        ml="sm"
        pb="xs"
        checked={fitContainToWidth}
        onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToWidth, e.target.checked)}
      />
      <Checkbox
        label="Contain to height"
        ml="sm"
        pb="xs"
        checked={fitContainToHeight}
        onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToHeight, e.target.checked)}
      />
      <Checkbox
        label="Stretch small pages"
        ml="sm"
        pb="xs"
        disabled={!(fitContainToHeight || fitContainToWidth)}
        checked={fitStretch}
        onChange={(e) => updateReaderSetting(ReaderSetting.FitStretch, e.target.checked)}
      />

      <Text pb="xs">Rendering</Text>
      <Checkbox
        label="Optimize image contrast"
        ml="sm"
        pb="xs"
        checked={optimizeContrast}
        onChange={(e) => updateReaderSetting(ReaderSetting.OptimizeContrast, e.target.checked)}
      />

      <Text pb="xs">Key Bindings</Text>
      <Group ml="sm">
        <Button variant="default" onClick={() => setShowingKeybinds(!showingKeybinds)}>
          {showingKeybinds ? 'Hide' : 'Show'} keybinds
        </Button>
      </Group>
      <Collapse in={showingKeybinds} ml="sm" pb="md">
        <Table verticalSpacing="xs" style={{ maxWidth: 400 }}>
          <tbody>
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
                name: 'Toggle Double Page Offset',
                value: keyToggleOffsetDoubleSpreads,
                setting: ReaderSetting.KeyToggleOffsetDoubleSpreads,
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
              <tr key={entry.setting}>
                <td>{entry.name}</td>
                <td>
                  <Button
                    variant="default"
                    size="xs"
                    fullWidth
                    onKeyDownCapture={(e: any) => updateKeySetting(e, entry.setting)}
                    sx={(theme) => ({
                      '&:focus': {
                        backgroundColor: theme.colors.dark[3],
                      },
                    })}
                  >
                    {entry.value}
                  </Button>
                </td>
                <td>
                  {entry.value !== DefaultSettings[entry.setting] ? (
                    <Button
                      variant="default"
                      size="xs"
                      fullWidth
                      onClick={() =>
                        updateReaderSetting(entry.setting, DefaultSettings[entry.setting])
                      }
                    >
                      Reset
                    </Button>
                  ) : (
                    <></>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Collapse>
    </>
  );
};

export default ReaderSettings;
