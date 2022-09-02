/* eslint-disable react/button-has-type */
/* eslint-disable react/display-name */
import React, { useEffect } from 'react';
import { CaretRightOutlined, CheckOutlined, DownloadOutlined } from '@ant-design/icons';
import { Chapter, Series } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useHistory } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styles from './ChapterTableContextMenu.css';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import { toggleChapterRead } from '../../features/library/utils';
import routes from '../../constants/routes.json';
import ipcChannels from '../../constants/ipcChannels.json';
import { chapterListState, seriesState } from '../../state/libraryStates';
import { chapterLanguagesState, customDownloadsDirState } from '../../state/settingStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const WIDTH = 150;
const HEIGHT = 130;

type Props = {
  position: { x: number; y: number };
  visible: boolean;
  series: Series;
  chapter: Chapter | undefined;
  chapterList: Chapter[];
  close: () => void;
};

const ChapterTableContextMenu: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const setChapterList = useSetRecoilState(chapterListState);
  const setSeries = useSetRecoilState(seriesState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const getPreviousChapters = () => {
    return props.chapterList.filter((chapter: Chapter) => {
      return (
        props.chapter !== undefined &&
        parseFloat(chapter.chapterNumber) < parseFloat(props.chapter.chapterNumber)
      );
    });
  };

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
      history.push(`${routes.READER}/${props.series.id}/${props.chapter.id}`);
    }
  };

  const handleToggleRead = () => {
    props.close();
    if (props.chapter !== undefined) {
      toggleChapterRead(props.chapter, props.series, setChapterList, setSeries, chapterLanguages);
    }
  };

  const handleMarkPrevious = (read: boolean) => {
    props.close();
    getPreviousChapters().forEach((chapter: Chapter) => {
      if ((read && !chapter.read) || (!read && chapter.read)) {
        toggleChapterRead(chapter, props.series, setChapterList, setSeries, chapterLanguages);
      }
    });
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

  if (!props.visible) return <></>;
  return (
    <div
      className={styles.container}
      style={{
        width: WIDTH,
        left: x,
        top: y,
      }}
    >
      <button className={styles.button} onClick={() => handleRead()}>
        <CaretRightOutlined /> Read
      </button>
      <button className={styles.button} onClick={() => handleToggleRead()}>
        <CheckOutlined /> Toggle read
      </button>
      <button className={styles.button} onClick={() => handleMarkPrevious(true)}>
        Mark previous read
      </button>
      <button className={styles.button} onClick={() => handleMarkPrevious(false)}>
        Mark previous unread
      </button>
      <hr className={styles.divider} />
      <button className={styles.button} onClick={() => handleDownload()}>
        <DownloadOutlined /> Download
      </button>
    </div>
  );
};

export default ChapterTableContextMenu;
