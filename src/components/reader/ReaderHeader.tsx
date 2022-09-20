/* eslint-disable react/button-has-type */
import React from 'react';
import { Chapter } from 'houdoku-extension-lib';
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
import { Box, Button, Center, Group, MantineTheme, Menu, ScrollArea } from '@mantine/core';
import styles from './ReaderHeader.css';
import { ReadingDirection, PageStyle, OffsetPages } from '../../models/types';
import {
  chapterState,
  lastPageNumberState,
  pageNumberState,
  relevantChapterListState,
  showingSettingsModalState,
  pageGroupListState,
} from '../../state/readerStates';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
  offsetPagesState,
  pageStyleState,
  readingDirectionState,
} from '../../state/settingStates';
import {
  nextOffsetPages,
  nextPageStyle,
  nextReadingDirection,
} from '../../features/settings/utils';

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
  setChapter: (id: string) => void;
  changeChapter: (previous: boolean) => void;
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
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
  const [offsetPages, setOffsetPages] = useRecoilState(offsetPagesState);

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

  const getCurrentPageNumText = () => {
    let text = `${pageNumber}`;
    if (pageStyle === PageStyle.Double) {
      const curGroup = pageGroupList.find((group) => group.includes(pageNumber));
      if (curGroup && curGroup.length > 1) {
        text = `${curGroup[0]}-${curGroup[1]}`;
      }
    }
    return `${text} / ${lastPageNumber}`;
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
      <Button compact styles={buttonStyles} radius={0} leftIcon={opts.icon} onClick={opts.func}>
        {opts.text}
      </Button>
    );
  };

  return (
    <Box
      className={styles.container}
      sx={(theme) => ({
        backgroundColor: theme.colors.dark[6],
      })}
    >
      <Center>
        <Group spacing={4} noWrap>
          <Button
            compact
            styles={buttonStyles}
            radius={0}
            leftIcon={<IconArrowLeft size={14} />}
            onClick={props.exitPage}
          >
            Go Back
          </Button>

          <Group spacing={0} noWrap>
            <Button
              px={2}
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronLeft size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  props.getAdjacentChapterId(true) === null) ||
                (readingDirection === ReadingDirection.RightToLeft &&
                  props.getAdjacentChapterId(false) === null)
              }
              onClick={() => props.changeChapter(true)}
            />
            <Menu shadow="md" width={110} trigger="hover">
              <Menu.Target>
                <Button compact styles={buttonStyles} radius={0} pb={2}>
                  {chapter && chapter.chapterNumber
                    ? `Chapter ${chapter.chapterNumber}`
                    : 'Unknown Chapter'}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <ScrollArea.Autosize maxHeight={220} style={{ width: 100 }}>
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
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronRight size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  props.getAdjacentChapterId(false) === null) ||
                (readingDirection === ReadingDirection.RightToLeft &&
                  props.getAdjacentChapterId(true) === null)
              }
              onClick={() => props.changeChapter(false)}
            />
          </Group>

          <Group spacing={0} noWrap>
            <Button
              px={2}
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronsLeft size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight && pageNumber <= 1) ||
                (readingDirection === ReadingDirection.RightToLeft && pageNumber >= lastPageNumber)
              }
              onClick={() => props.changePage(true, true)}
            />
            <Button
              px={2}
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronLeft size={16} />}
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
                <Button compact styles={buttonStyles} radius={0} px={4} pb={2}>
                  {getCurrentPageNumText()}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <ScrollArea.Autosize maxHeight={220} style={{ width: 100 }}>
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
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronRight size={16} />}
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
              compact
              styles={buttonStyles}
              radius={0}
              rightIcon={<IconChevronsRight size={16} />}
              disabled={
                (readingDirection === ReadingDirection.LeftToRight &&
                  pageNumber >= lastPageNumber) ||
                (readingDirection === ReadingDirection.RightToLeft && pageNumber <= 1)
              }
              onClick={() => props.changePage(false, true)}
            />
          </Group>

          <Button
            compact
            styles={buttonStyles}
            radius={0}
            leftIcon={ICONS_PAGE_STYLE[pageStyle]}
            onClick={() => setPageStyle(nextPageStyle(pageStyle))}
          >
            {TEXT_PAGE_STYLE[pageStyle]}
          </Button>

          {pageStyle === PageStyle.Double ? (
            <Button
              compact
              styles={buttonStyles}
              radius={0}
              leftIcon={ICONS_OFFSET_PAGES[offsetPages]}
              onClick={() => setOffsetPages(nextOffsetPages(offsetPages))}
            >
              {TEXT_OFFSET_PAGES[offsetPages]}
            </Button>
          ) : (
            ''
          )}

          {renderFitButton()}

          <Button
            compact
            styles={buttonStyles}
            radius={0}
            leftIcon={fitStretch ? <IconCheck size={14} /> : <IconX size={14} />}
            disabled={!(fitContainToHeight || fitContainToWidth)}
            onClick={() => setFitStretch(!fitStretch)}
          >
            Stretch to Fill
          </Button>

          <Button
            compact
            styles={buttonStyles}
            radius={0}
            leftIcon={ICONS_READING_DIRECTION[readingDirection]}
            onClick={() => setReadingDirection(nextReadingDirection(readingDirection))}
          >
            {TEXT_READING_DIRECTION[readingDirection]}
          </Button>

          <Button
            compact
            styles={buttonStyles}
            radius={0}
            leftIcon={<IconSettings size={14} />}
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
