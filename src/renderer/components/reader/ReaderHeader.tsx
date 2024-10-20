import React from 'react';
import { Chapter, Languages } from '@tiyo/common';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  IconArrowAutofitHeight,
  IconArrowAutofitWidth,
  IconArrowBigLeft,
  IconArrowBigRight,
  IconArrowLeft,
  IconArrowsMaximize,
  IconBook,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleOff,
  IconFile,
  IconLetterF,
  IconSettings,
  IconSpacingVertical,
  IconX,
} from '@tabler/icons';
import { Box, Button, Center, Group, Menu, ScrollArea } from '@mantine/core';
import flags from '@/renderer/img/flags.png';
import styles from './ReaderHeader.module.css';
import { ReadingDirection, PageStyle, OffsetPages } from '@/common/models/types';
import {
  chapterState,
  lastPageNumberState,
  pageNumberState,
  relevantChapterListState,
  showingSettingsModalState,
  pageGroupListState,
  languageChapterListState,
} from '@/renderer/state/readerStates';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
  offsetPagesState,
  pageStyleState,
  readingDirectionState,
} from '@/renderer/state/settingStates';
import {
  nextOffsetPages,
  nextPageStyle,
  nextReadingDirection,
} from '@/renderer/features/settings/utils';

const TEXT_PAGE_STYLE = {
  [PageStyle.Single]: 'Single Page',
  [PageStyle.Double]: 'Double Page',
  [PageStyle.LongStrip]: 'Long Strip',
};

const ICONS_PAGE_STYLE = {
  [PageStyle.Single]: <IconFile size={14} />,
  [PageStyle.Double]: <IconBook size={14} />,
  [PageStyle.LongStrip]: <IconSpacingVertical size={14} />,
};

const TEXT_READING_DIRECTION = {
  [ReadingDirection.LeftToRight]: 'Left-to-Right',
  [ReadingDirection.RightToLeft]: 'Right-to-Left',
};

const ICONS_READING_DIRECTION = {
  [ReadingDirection.LeftToRight]: <IconArrowBigRight size={14} />,
  [ReadingDirection.RightToLeft]: <IconArrowBigLeft size={14} />,
};

const TEXT_OFFSET_PAGES = {
  [OffsetPages.All]: 'Offset All',
  [OffsetPages.First]: 'Offset First',
  [OffsetPages.None]: 'No Offset',
};

const ICONS_OFFSET_PAGES = {
  [OffsetPages.All]: <IconCheck size={14} />,
  [OffsetPages.First]: <IconLetterF size={14} />,
  [OffsetPages.None]: <IconX size={14} />,
};

type Props = {
  changePage: (left: boolean, toBound?: boolean) => void;
  setChapter: (id: string, page?: number) => void;
  changeChapter: (direction: 'left' | 'right' | 'next' | 'previous') => void;
  getAdjacentChapterId: (previous: boolean) => string | null;
  exitPage: () => void;
};

const ReaderHeader: React.FC<Props> = (props: Props) => {
  const [pageNumber, setPageNumber] = useRecoilState(pageNumberState);
  const [showingSettingsModal, setShowingSettingsModal] = useRecoilState(showingSettingsModalState);
  const lastPageNumber = useRecoilValue(lastPageNumberState);
  const pageGroupList = useRecoilValue(pageGroupListState);
  const chapter = useRecoilValue(chapterState);
  const relevantChapterList = useRecoilValue(relevantChapterListState);
  const languageChapterList = useRecoilValue(languageChapterListState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
  const [offsetPages, setOffsetPages] = useRecoilState(offsetPagesState);

  // const buttonStyles = (theme: MantineTheme) => ({
  //   root: {
  //     height: 24,
  //     fontSize: 12,
  //     color: theme.colors.gray[4],
  //     backgroundColor: theme.colors.dark[9],
  //     '&:hover': {
  //       backgroundColor: theme.colors.red[3],
  //     },
  //     '&:disabled': {
  //       color: theme.colors.dark[6],
  //       backgroundColor: theme.colors.dark[4],
  //     },
  //   },
  //   leftIcon: {
  //     marginRight: 4,
  //   },
  //   rightIcon: {
  //     marginLeft: 0,
  //   },
  // });

  const getCurrentPageNumText = () => {
    let text = `${pageNumber}`;
    if (pageStyle === PageStyle.Double) {
      const curGroup = pageGroupList.find((group) => group.includes(pageNumber));
      if (curGroup && curGroup.length > 1) {
        text = `${curGroup[0]}-${curGroup[1]}`;
      }
    }
    return `${text} / ${lastPageNumber}`.replace('Infinity', '??');
  };

  const renderFitButton = () => {
    let opts = {
      text: 'No Limit',
      icon: <IconCircleOff size={14} />,
      func: () => {
        setFitContainToWidth(true);
      },
    };
    if (fitContainToHeight && fitContainToWidth) {
      opts = {
        text: 'Fit Both',
        icon: <IconArrowsMaximize size={14} />,
        func: () => {
          setFitContainToHeight(false);
          setFitContainToWidth(false);
        },
      };
    } else {
      if (fitContainToWidth) {
        opts = {
          text: 'Fit Width',
          icon: <IconArrowAutofitWidth size={14} />,
          func: () => {
            setFitContainToWidth(false);
            setFitContainToHeight(true);
          },
        };
      }
      if (fitContainToHeight) {
        opts = {
          text: 'Fit Height',
          icon: <IconArrowAutofitHeight size={14} />,
          func: () => {
            setFitContainToWidth(true);
          },
        };
      }
    }

    return (
      <Button
        size="xs"
        className={styles.button}
        radius={0}
        leftSection={opts.icon}
        onClick={opts.func}
      >
        {opts.text}
      </Button>
    );
  };

  return (
    <Box className={styles.container} bg="bg.2">
      <Center>
        <Group gap={4} wrap="nowrap">
          <Button
            size="xs"
            className={styles.button}
            radius={0}
            leftSection={<IconArrowLeft size={14} />}
            onClick={props.exitPage}
          >
            Go Back
          </Button>

          <Group gap={0} wrap="nowrap">
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronLeft size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  props.getAdjacentChapterId(true) === null) ||
                (readingDirection === ReadingDirection.RightToLeft &&
                  props.getAdjacentChapterId(false) === null)
              }
              onClick={() => props.changeChapter('left')}
            />
            <Menu shadow="md" width={110} trigger="hover">
              <Menu.Target>
                <Button size="xs" className={styles.button} radius={0} pb={2}>
                  {chapter && chapter.chapterNumber
                    ? `Chapter ${chapter.chapterNumber}`
                    : 'Unknown Chapter'}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <ScrollArea.Autosize mah={220} style={{ width: 100 }}>
                  {relevantChapterList.map((relevantChapter: Chapter) => (
                    <Menu.Item
                      key={relevantChapter.id}
                      onClick={() => {
                        if (relevantChapter.id) props.setChapter(relevantChapter.id);
                      }}
                    >
                      {`Chapter ${relevantChapter.chapterNumber}`}
                    </Menu.Item>
                  ))}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronRight size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  props.getAdjacentChapterId(false) === null) ||
                (readingDirection === ReadingDirection.RightToLeft &&
                  props.getAdjacentChapterId(true) === null)
              }
              onClick={() => props.changeChapter('right')}
            />
          </Group>

          <Group gap={0} wrap="nowrap">
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronsLeft size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight && pageNumber <= 1) ||
                (readingDirection === ReadingDirection.RightToLeft && pageNumber >= lastPageNumber)
              }
              onClick={() => props.changePage(true, true)}
            />
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronLeft size={16} />}
              disabled={
                (readingDirection === ReadingDirection.RightToLeft &&
                  pageNumber === lastPageNumber &&
                  props.getAdjacentChapterId(false) === null) ||
                (readingDirection === ReadingDirection.LeftToRight &&
                  pageNumber <= 1 &&
                  props.getAdjacentChapterId(true) === null)
              }
              onClick={() => props.changePage(true)}
            />
            <Menu shadow="md" width={110} trigger="hover">
              <Menu.Target>
                <Button size="xs" className={styles.button} radius={0} px={4} pb={2}>
                  {getCurrentPageNumText()}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <ScrollArea.Autosize mah={220} style={{ width: 100 }}>
                  {Array.from({ length: lastPageNumber }, (_v, k) => k + 1).map((i: number) => (
                    <Menu.Item key={i} onClick={() => setPageNumber(i)}>
                      Page {i}
                    </Menu.Item>
                  ))}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronRight size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  pageNumber === lastPageNumber &&
                  props.getAdjacentChapterId(false) === null) ||
                (readingDirection === ReadingDirection.RightToLeft &&
                  pageNumber <= 1 &&
                  props.getAdjacentChapterId(true) === null)
              }
              onClick={() => props.changePage(false)}
            />
            <Button
              px={2}
              size="xs"
              className={styles.button}
              radius={0}
              rightSection={<IconChevronsRight size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  pageNumber >= lastPageNumber) ||
                (readingDirection === ReadingDirection.RightToLeft && pageNumber <= 1)
              }
              onClick={() => props.changePage(false, true)}
            />
          </Group>

          <Button
            px={8}
            size="xs"
            className={styles.button}
            radius={0}
            leftSection={ICONS_PAGE_STYLE[pageStyle]}
            onClick={() => setPageStyle(nextPageStyle(pageStyle))}
          >
            {TEXT_PAGE_STYLE[pageStyle]}
          </Button>

          {pageStyle === PageStyle.Double ? (
            <Button
              size="xs"
              className={styles.button}
              radius={0}
              leftSection={ICONS_OFFSET_PAGES[offsetPages]}
              onClick={() => setOffsetPages(nextOffsetPages(offsetPages))}
            >
              {TEXT_OFFSET_PAGES[offsetPages]}
            </Button>
          ) : (
            ''
          )}

          {renderFitButton()}

          <Button
            size="xs"
            className={styles.button}
            radius={0}
            leftSection={fitStretch ? <IconCheck size={14} /> : <IconX size={14} />}
            disabled={!(fitContainToHeight || fitContainToWidth)}
            onClick={() => setFitStretch(!fitStretch)}
          >
            Stretch to Fill
          </Button>

          <Button
            size="xs"
            className={styles.button}
            radius={0}
            leftSection={ICONS_READING_DIRECTION[readingDirection]}
            onClick={() => setReadingDirection(nextReadingDirection(readingDirection))}
          >
            {TEXT_READING_DIRECTION[readingDirection]}
          </Button>

          {languageChapterList.length > 1 ? (
            <Menu shadow="md" width={320} trigger="hover">
              <Menu.Target>
                <Button
                  leftSection={
                    chapter && chapter.languageKey ? (
                      <div className="flag-container">
                        <img
                          src={flags}
                          title={Languages[chapter.languageKey].name}
                          alt={Languages[chapter.languageKey].name}
                          className={`flag flag-${Languages[chapter.languageKey].flagCode}`}
                        />
                      </div>
                    ) : (
                      <></>
                    )
                  }
                  size="xs"
                  className={styles.button}
                  radius={0}
                >
                  <div>
                    {chapter && chapter.languageKey
                      ? `${Languages[chapter.languageKey].name}`
                      : 'Unknown Language'}
                  </div>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <ScrollArea.Autosize mah={220} style={{ width: 310 }}>
                  {languageChapterList.map((languageChapter: Chapter) => (
                    <Menu.Item
                      key={languageChapter.id}
                      onClick={() => {
                        if (languageChapter.id) props.setChapter(languageChapter.id, pageNumber);
                      }}
                    >
                      {Languages[languageChapter.languageKey] === undefined ? (
                        <></>
                      ) : (
                        <div style={{ display: 'flex' }}>
                          <div style={{ marginRight: '5px' }} className="flag-container">
                            <img
                              src={flags}
                              title={Languages[languageChapter.languageKey].name}
                              alt={Languages[languageChapter.languageKey].name}
                              className={`flag flag-${
                                Languages[languageChapter.languageKey].flagCode
                              }`}
                            />
                          </div>
                          {`${Languages[languageChapter.languageKey].name} ${
                            languageChapter.volumeNumber
                              ? `Vol. ${languageChapter.volumeNumber}`
                              : ''
                          } by ${languageChapter.groupName}`}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </ScrollArea.Autosize>
              </Menu.Dropdown>
            </Menu>
          ) : (
            ''
          )}

          <Button
            size="xs"
            className={styles.button}
            radius={0}
            leftSection={<IconSettings size={14} />}
            onClick={() => setShowingSettingsModal(!showingSettingsModal)}
          >
            Settings
          </Button>
        </Group>
      </Center>
    </Box>
  );
};

export default ReaderHeader;
