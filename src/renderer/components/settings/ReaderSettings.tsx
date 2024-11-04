import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Table, Center, Box, Collapse, Group, Radio, Slider, Menu, Stack } from '@mantine/core';
import {
  IconArrowBigLeft,
  IconArrowBigRight,
  IconBook,
  IconFile,
  IconSpacingVertical,
} from '@tabler/icons';
import {
  ReadingDirection,
  PageStyle,
  ReaderSetting,
  DefaultSettings,
  OffsetPages,
} from '@/common/models/types';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
  keyCloseOrBackState,
  keyExitState,
  keyFirstPageState,
  keyLastPageState,
  keyChapterRightState,
  keyPageRightState,
  keyChapterLeftState,
  keyPageLeftState,
  keyTogglePageStyleState,
  keyToggleReadingDirectionState,
  keyToggleShowingHeaderState,
  keyToggleShowingSettingsModalState,
  keyToggleShowingScrollbarState,
  pageStyleState,
  readingDirectionState,
  pageGapState,
  offsetPagesState,
  maxPageWidthState,
  pageWidthMetricState,
  optimizeContrastState,
  keyToggleOffsetDoubleSpreadsState,
  keyToggleFullscreenState,
  themeState,
} from '@/renderer/state/settingStates';
import DefaultSegmentedControl from '../general/DefaultSegmentedControl';
import DefaultText from '../general/DefaultText';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultButton from '../general/DefaultButton';
import DefaultRadio from '../general/DefaultRadio';
import DefaultMenu from '../general/DefaultMenu';
import { themeProps } from '@/renderer/util/themes';

const ReaderSettings: React.FC = () => {
  const theme = useRecoilValue(themeState);
  const [showingKeybinds, setShowingKeybinds] = useState(false);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
  const [keyPageLeft, setKeyPageLeft] = useRecoilState(keyPageLeftState);
  const [keyFirstPage, setKeyFirstPage] = useRecoilState(keyFirstPageState);
  const [keyPageRight, setKeyPageRight] = useRecoilState(keyPageRightState);
  const [keyLastPage, setKeyLastPage] = useRecoilState(keyLastPageState);
  const [keyChapterLeft, setKeyChapterLeft] = useRecoilState(keyChapterLeftState);
  const [keyChapterRight, setKeyChapterRight] = useRecoilState(keyChapterRightState);
  const [keyToggleReadingDirection, setKeyToggleReadingDirection] = useRecoilState(
    keyToggleReadingDirectionState,
  );
  const [keyTogglePageStyle, setKeyTogglePageStyle] = useRecoilState(keyTogglePageStyleState);
  const [keyToggleOffsetDoubleSpreads, setKeyToggleOffsetDoubleSpreads] = useRecoilState(
    keyToggleOffsetDoubleSpreadsState,
  );
  const [keyToggleShowingSettingsModal, setKeyToggleShowingSettingsModal] = useRecoilState(
    keyToggleShowingSettingsModalState,
  );
  const [keyToggleShowingScrollbar, setKeyToggleShowingScrollbar] = useRecoilState(
    keyToggleShowingScrollbarState,
  );
  const [keyToggleShowingHeader, setKeyToggleShowingHeader] = useRecoilState(
    keyToggleShowingHeaderState,
  );
  const [keyToggleFullscreen, setKeyToggleFullscreen] = useRecoilState(keyToggleFullscreenState);
  const [keyExit, setKeyExit] = useRecoilState(keyExitState);
  const [keyCloseOrBack, setKeyCloseOrBack] = useRecoilState(keyCloseOrBackState);
  const [pageGap, setPageGap] = useRecoilState(pageGapState);
  const [offsetPages, setOffsetPages] = useRecoilState(offsetPagesState);
  const [maxPageWidth, setMaxPageWidth] = useRecoilState(maxPageWidthState);
  const [pageWidthMetric, setPageWidthMetric] = useRecoilState(pageWidthMetricState);
  const [optimizeContrast, setOptimizeContrast] = useRecoilState(optimizeContrastState);

  // biome-ignore lint/suspicious/noExplicitAny: arbitrary schema
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
      case ReaderSetting.KeyPageLeft:
        setKeyPageLeft(value);
        break;
      case ReaderSetting.KeyFirstPage:
        setKeyFirstPage(value);
        break;
      case ReaderSetting.KeyPageRight:
        setKeyPageRight(value);
        break;
      case ReaderSetting.KeyLastPage:
        setKeyLastPage(value);
        break;
      case ReaderSetting.KeyChapterLeft:
        setKeyChapterLeft(value);
        break;
      case ReaderSetting.KeyChapterRight:
        setKeyChapterRight(value);
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
      case ReaderSetting.KeyToggleShowingScrollbar:
        setKeyToggleShowingScrollbar(value);
        break;
      case ReaderSetting.KeyToggleShowingHeader:
        setKeyToggleShowingHeader(value);
        break;
      case ReaderSetting.KeyToggleFullscreen:
        setKeyToggleFullscreen(value);
        break;
      case ReaderSetting.KeyExit:
        setKeyExit(value);
        break;
      case ReaderSetting.KeyCloseOrBack:
        setKeyCloseOrBack(value);
        break;
      case ReaderSetting.PageGap:
        setPageGap(value);
        break;
      case ReaderSetting.OffsetPages:
        setOffsetPages(value);
        break;
      case ReaderSetting.MaxPageWidth:
        setMaxPageWidth(value);
        break;
      case ReaderSetting.PageWidthMetric:
        setPageWidthMetric(value);
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
      <DefaultText pb="xs">Page Style</DefaultText>
      <Stack gap="xs">
        <DefaultSegmentedControl
          maw={400}
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

        <DefaultCheckbox
          label="Spacing between pages"
          ml="sm"
          disabled={pageStyle === PageStyle.Single}
          checked={pageGap}
          onChange={(e) => updateReaderSetting(ReaderSetting.PageGap, e.target.checked)}
        />
        <Radio.Group
          ml="sm"
          pb="sm"
          value={offsetPages}
          onChange={(value: string) => setOffsetPages(value as OffsetPages)}
        >
          <Group>
            <DefaultRadio
              pb={4}
              value={OffsetPages.First}
              label="Offset first page"
              disabled={pageStyle !== PageStyle.Double}
            />
            <DefaultRadio
              pb={4}
              value={OffsetPages.All}
              label="Offset all"
              disabled={pageStyle !== PageStyle.Double}
            />
            <DefaultRadio
              value={OffsetPages.None}
              label="No offset"
              disabled={pageStyle !== PageStyle.Double}
            />
          </Group>
        </Radio.Group>
      </Stack>

      <DefaultText pb="xs">Reading Direction</DefaultText>
      <Stack>
        <DefaultSegmentedControl
          mb="sm"
          maw={400}
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
      </Stack>

      <DefaultText pb="xs">Image Sizing</DefaultText>
      <Stack gap={4} ml="sm" mb="xs">
        <DefaultCheckbox
          label="Contain to width"
          value={fitContainToWidth ? 'on' : 'off'}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToWidth, e.target.checked)}
        />
        <DefaultCheckbox
          label="Contain to height"
          checked={fitContainToHeight}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToHeight, e.target.checked)}
        />
        <DefaultCheckbox
          label="Stretch small pages"
          disabled={!(fitContainToHeight || fitContainToWidth)}
          checked={fitStretch}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitStretch, e.target.checked)}
        />
      </Stack>

      <Group align="left" gap="xs" wrap="nowrap">
        <DefaultText size="sm" ml="sm">
          Max page width
        </DefaultText>
        <DefaultMenu shadow="md" width={50} trigger="hover">
          <Menu.Target>
            <DefaultButton size="xs" h={24} radius={0} px={4} pb={2}>
              {pageWidthMetric}
            </DefaultButton>
          </Menu.Target>
          <Menu.Dropdown {...themeProps(theme)}>
            <Menu.Item
              onClick={() => {
                updateReaderSetting(ReaderSetting.PageWidthMetric, '%');
              }}
            >
              %
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                updateReaderSetting(ReaderSetting.PageWidthMetric, 'px');
              }}
            >
              px
            </Menu.Item>
          </Menu.Dropdown>
        </DefaultMenu>
      </Group>

      <Slider
        label={`${maxPageWidth}${pageWidthMetric}`}
        mx="sm"
        min={10}
        max={pageWidthMetric === '%' ? 100 : window.innerWidth}
        step={10}
        styles={{ markLabel: { display: 'none' } }}
        maw={400}
        marks={
          pageWidthMetric === '%'
            ? Array.from({ length: 10 }, (_v, k) => (k + 1) * 10).map((i: number) => ({
                value: i,
              }))
            : []
        }
        disabled={!fitContainToWidth}
        defaultValue={maxPageWidth}
        onChange={(value) => updateReaderSetting(ReaderSetting.MaxPageWidth, value)}
      />

      <DefaultText py="xs">Rendering</DefaultText>
      <DefaultCheckbox
        label="Optimize image contrast"
        ml="sm"
        pb="sm"
        checked={optimizeContrast}
        onChange={(e) => updateReaderSetting(ReaderSetting.OptimizeContrast, e.target.checked)}
      />

      <DefaultText pb="xs">Key Bindings</DefaultText>
      <Group ml="sm">
        <DefaultButton variant="default" onClick={() => setShowingKeybinds(!showingKeybinds)}>
          {showingKeybinds ? 'Hide' : 'Show'} keybinds
        </DefaultButton>
      </Group>
      <Collapse in={showingKeybinds} ml="sm" pb="md">
        <Table verticalSpacing="xs" style={{ maxWidth: 400 }}>
          <tbody>
            {[
              {
                name: 'Turn Page Right',
                value: keyPageRight,
                setting: ReaderSetting.KeyPageRight,
              },
              {
                name: 'Turn Page Left',
                value: keyPageLeft,
                setting: ReaderSetting.KeyPageLeft,
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
                name: 'Change Chapter Right',
                value: keyChapterRight,
                setting: ReaderSetting.KeyChapterRight,
              },
              {
                name: 'Change Chapter Left',
                value: keyChapterLeft,
                setting: ReaderSetting.KeyChapterLeft,
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
                name: 'Toggle Fullscreen',
                value: keyToggleFullscreen,
                setting: ReaderSetting.KeyToggleFullscreen,
              },
              {
                name: 'Show Settings Menu',
                value: keyToggleShowingSettingsModal,
                setting: ReaderSetting.KeyToggleShowingSettingsModal,
              },
              {
                name: 'Toggle Scrollbar',
                value: keyToggleShowingScrollbar,
                setting: ReaderSetting.KeyToggleShowingScrollbar,
              },
              {
                name: 'Toggle Menu Bar',
                value: keyToggleShowingHeader,
                setting: ReaderSetting.KeyToggleShowingHeader,
              },
            ].map((entry) => (
              <tr key={entry.setting}>
                <td>
                  <DefaultText>{entry.name}</DefaultText>
                </td>
                <td>
                  <DefaultButton
                    variant="default"
                    size="xs"
                    fullWidth
                    onKeyDownCapture={(e: React.KeyboardEvent) =>
                      updateKeySetting(e, entry.setting)
                    }
                  >
                    {entry.value}
                  </DefaultButton>
                </td>
                <td>
                  {entry.value !== DefaultSettings[entry.setting] ? (
                    <DefaultButton
                      variant="default"
                      size="xs"
                      fullWidth
                      onClick={() =>
                        updateReaderSetting(entry.setting, DefaultSettings[entry.setting])
                      }
                    >
                      Reset
                    </DefaultButton>
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
