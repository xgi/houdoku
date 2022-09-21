import React, { useEffect, useState } from 'react';
import { Chapter, Series } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import {
  IconArrowBigLeftLines,
  IconArrowBigRightLines,
  IconChecks,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import { markChapters } from '../../features/library/utils';
import routes from '../../constants/routes.json';
import ipcChannels from '../../constants/ipcChannels.json';
import { chapterListState, seriesState } from '../../state/libraryStates';
import { chapterLanguagesState, customDownloadsDirState } from '../../state/settingStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const WIDTH = 200;
const HEIGHT = 220;

type Props = {
  position: { x: number; y: number };
  visible: boolean;
  series: Series;
  chapter: Chapter | undefined;
  chapterList: Chapter[];
  setDownloadModalProps: (chapter: Chapter, direction: 'next' | 'previous') => void;
  close: () => void;
};

const ChapterTableContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const setChapterList = useSetRecoilState(chapterListState);
  const setSeries = useSetRecoilState(seriesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [previousChapters, setPreviousChapters] = useState<Chapter[]>([]);

  const handleDownload = () => {
    props.close();
    if (props.chapter !== undefined) {
      downloaderClient.add([
        {
          chapter: props.chapter,
          series: props.series,
          downloadsDir: customDownloadsDir || defaultDownloadsDir,
        } as DownloadTask,
      ]);
      downloaderClient.start();
    }
  };

  const handleDownloadMultiple = (direction: 'next' | 'previous') => {
    props.close();
    if (props.chapter !== undefined) {
      props.setDownloadModalProps(props.chapter, direction);
    }
  };

  const handleRead = () => {
    props.close();
    if (props.chapter !== undefined) {
      navigate(`${routes.READER}/${props.series.id}/${props.chapter.id}`);
    }
  };

  const handleToggleRead = () => {
    props.close();
    if (props.chapter !== undefined) {
      markChapters(
        [props.chapter],
        props.series,
        !props.chapter.read,
        setChapterList,
        setSeries,
        chapterLanguages
      );
    }
  };

  const handleMarkPrevious = (read: boolean) => {
    props.close();
    markChapters(previousChapters, props.series, read, setChapterList, setSeries, chapterLanguages);
  };

  let { x, y } = props.position;
  if (props.position.x + WIDTH > window.innerWidth) {
    x = props.position.x - WIDTH;
  }
  if (props.position.y + HEIGHT > window.innerHeight) {
    y = props.position.y - HEIGHT;
  }

  useEffect(() => {
    const mousedownListener = (e: MouseEvent) => {
      if (e.clientX < x || e.clientX > x + WIDTH || e.clientY < y || e.clientY > y + HEIGHT) {
        props.close();
      }
    };

    document.addEventListener('mousedown', mousedownListener);
    return () => {
      document.removeEventListener('mousedown', mousedownListener);
    };
  });

  useEffect(() => {
    setPreviousChapters(
      props.chapterList.filter(
        (chapter: Chapter) =>
          props.chapter !== undefined &&
          parseFloat(chapter.chapterNumber) < parseFloat(props.chapter.chapterNumber)
      )
    );
  }, [props.chapter, props.chapterList]);

  if (!props.visible || !props.chapter) return <></>;
  return (
    <Portal>
      <Menu
        shadow="md"
        width={WIDTH}
        opened
        styles={() => ({
          dropdown: {
            left: x,
            top: y,
          },
        })}
      >
        <Menu.Dropdown style={{ position: 'absolute', left: x, top: y }}>
          <Menu.Item icon={<IconPlayerPlay size={14} />} onClick={handleRead}>
            Read chapter
          </Menu.Item>

          {props.chapter.read ? (
            <Menu.Item icon={<IconEyeOff size={14} />} onClick={handleToggleRead}>
              Mark unread
            </Menu.Item>
          ) : (
            <Menu.Item icon={<IconEye size={14} />} onClick={handleToggleRead}>
              Mark read
            </Menu.Item>
          )}

          {previousChapters.every((chapter) => chapter.read) ? (
            <Menu.Item icon={<IconX size={14} />} onClick={() => handleMarkPrevious(false)}>
              Mark previous unread
            </Menu.Item>
          ) : (
            <Menu.Item icon={<IconChecks size={14} />} onClick={() => handleMarkPrevious(true)}>
              Mark previous read
            </Menu.Item>
          )}

          <Menu.Divider />

          <Menu.Item icon={<IconDownload size={14} />} onClick={handleDownload}>
            Download
          </Menu.Item>
          <Menu.Item
            icon={<IconArrowBigRightLines size={14} />}
            onClick={() => handleDownloadMultiple('next')}
          >
            Download next X
          </Menu.Item>
          <Menu.Item
            icon={<IconArrowBigLeftLines size={14} />}
            onClick={() => handleDownloadMultiple('previous')}
          >
            Download previous X
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Portal>
  );
};

export default ChapterTableContextMenu;
