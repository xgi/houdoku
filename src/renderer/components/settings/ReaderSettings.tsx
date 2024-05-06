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
  Radio,
  Slider,
  Menu,
  MantineTheme,
  Stack,
} from '@mantine/core';
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
} from '@/renderer/state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const ReaderSettings: React.FC<Props> = () => {
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

  const buttonStyles = (theme: MantineTheme) => ({
    root: {
      height: 24,
      fontSize: 12,
      color: theme.colors.gray[4],
      backgroundColor: theme.colors.dark[7],
      '&:hover': {
        backgroundColor: theme.colors.dark[4],
      },
    },
    leftIcon: {
      marginRight: 4,
    },
    rightIcon: {
      marginLeft: 0,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateReaderSetting = (readerSetting: ReaderSetting, value: any) => {
    switch (readerSetting) {
      case ReaderSetting.ReadingDirection:
        setReadingDirection(value);
        break;
      case ReaderSetting.FitContainToWidth:
        console.log('updating');
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
      <Text pb="xs">Page Style</Text>
      <Stack gap="xs">
        <SegmentedControl
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

        <Checkbox
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
            <Radio
              pb={4}
              value={OffsetPages.First}
              label="Offset first page"
              disabled={pageStyle !== PageStyle.Double}
            />
            <Radio
              pb={4}
              value={OffsetPages.All}
              label="Offset all"
              disabled={pageStyle !== PageStyle.Double}
            />
            <Radio
              value={OffsetPages.None}
              label="No offset"
              disabled={pageStyle !== PageStyle.Double}
            />
          </Group>
        </Radio.Group>
      </Stack>

      <Text pb="xs">Reading Direction</Text>
      <Stack>
        <SegmentedControl
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

      <Text pb="xs">Image Sizing</Text>
      <Stack gap={4} ml="sm" mb="xs">
        <Checkbox
          label="Contain to width"
          // ml="sm"
          // pb="xs"
          value={fitContainToWidth ? 'on' : 'off'}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToWidth, e.target.checked)}
        />
        <Checkbox
          label="Contain to height"
          // ml="sm"
          // pb="xs"
          checked={fitContainToHeight}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitContainToHeight, e.target.checked)}
        />
        <Checkbox
          label="Stretch small pages"
          // ml="sm"
          disabled={!(fitContainToHeight || fitContainToWidth)}
          checked={fitStretch}
          onChange={(e) => updateReaderSetting(ReaderSetting.FitStretch, e.target.checked)}
        />
      </Stack>

      <Group align="left" gap="xs" wrap="nowrap">
        <Text size="sm" ml="sm">
          Max page width
        </Text>
        <Menu shadow="md" width={50} trigger="hover">
          <Menu.Target>
            <Button size="xs" styles={buttonStyles} radius={0} px={4} pb={2}>
              {pageWidthMetric}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
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
        </Menu>
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

      <Text py="xs">Rendering</Text>
      <Checkbox
        label="Optimize image contrast"
        ml="sm"
        pb="sm"
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
                <td>{entry.name}</td>
                <td>
                  <Button
                    variant="default"
                    size="xs"
                    fullWidth
                    onKeyDownCapture={(e) => updateKeySetting(e, entry.setting)}
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
