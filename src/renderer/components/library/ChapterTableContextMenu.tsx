import React, { useEffect, useState } from 'react';
import { Chapter, Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import {
  IconChecks,
  IconDownload,
  IconEye,
  IconEyeOff,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { markChapters } from '@/renderer/features/library/utils';
import routes from '@/common/constants/routes.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { chapterListState, seriesState } from '@/renderer/state/libraryStates';
import {
  chapterLanguagesState,
  customDownloadsDirState,
  themeState,
} from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import DefaultMenu from '../general/DefaultMenu';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const ELEMENT_ID = 'ChapterTableContextMenu';
const WIDTH = 200;
const HEIGHT = 150;

type Props = {
  position: { x: number; y: number };
  visible: boolean;
  series: Series;
  chapter: Chapter | undefined;
  chapterList: Chapter[];
  close: () => void;
};

const ChapterTableContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const theme = useRecoilValue(themeState);
  const setChapterList = useSetRecoilState(chapterListState);
  const setSeries = useSetRecoilState(seriesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [previousChapters, setPreviousChapters] = useState<Chapter[]>([]);
  const [sanitizedPos, setSanitizedPos] = useState<{ x: number; y: number }>(props.position);

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
        chapterLanguages,
      );
    }
  };

  const handleMarkPrevious = (read: boolean) => {
    props.close();
    markChapters(previousChapters, props.series, read, setChapterList, setSeries, chapterLanguages);
  };

  useEffect(() => {
    const newPos = { ...props.position };
    if (props.position.x + WIDTH > window.innerWidth) {
      newPos.x = props.position.x - WIDTH;
    }
    if (props.position.y + HEIGHT > window.innerHeight) {
      newPos.y = props.position.y - HEIGHT;
    }
    setSanitizedPos(newPos);
  }, [props.position]);

  useEffect(() => {
    const mousedownListener = (e: MouseEvent) => {
      if (
        e.clientX < sanitizedPos.x ||
        e.clientX > sanitizedPos.x + WIDTH ||
        e.clientY < sanitizedPos.y ||
        e.clientY > sanitizedPos.y + HEIGHT
      ) {
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
          parseFloat(chapter.chapterNumber) < parseFloat(props.chapter.chapterNumber),
      ),
    );
  }, [props.chapter, props.chapterList]);

  useEffect(() => {
    const element = document.getElementById(ELEMENT_ID);
    if (element) {
      element.style.setProperty('left', `${sanitizedPos.x}px`);
      element.style.setProperty('top', `${sanitizedPos.y}px`);
      element.style.removeProperty('display');
    }
  }, [sanitizedPos]);

  if (!props.visible || !props.chapter) return <></>;
  return (
    <Portal>
      <DefaultMenu shadow="md" width={WIDTH} opened>
        <Menu.Dropdown id={ELEMENT_ID} style={{ display: 'none' }} {...themeProps(theme)}>
          <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={handleRead}>
            Read chapter
          </Menu.Item>

          {props.chapter.read ? (
            <Menu.Item leftSection={<IconEyeOff size={14} />} onClick={handleToggleRead}>
              Mark unread
            </Menu.Item>
          ) : (
            <Menu.Item leftSection={<IconEye size={14} />} onClick={handleToggleRead}>
              Mark read
            </Menu.Item>
          )}

          {previousChapters.every((chapter) => chapter.read) ? (
            <Menu.Item leftSection={<IconX size={14} />} onClick={() => handleMarkPrevious(false)}>
              Mark previous unread
            </Menu.Item>
          ) : (
            <Menu.Item
              leftSection={<IconChecks size={14} />}
              onClick={() => handleMarkPrevious(true)}
            >
              Mark previous read
            </Menu.Item>
          )}

          <Menu.Item leftSection={<IconDownload size={14} />} onClick={handleDownload}>
            Download
          </Menu.Item>
        </Menu.Dropdown>
      </DefaultMenu>
    </Portal>
  );
};

export default ChapterTableContextMenu;
