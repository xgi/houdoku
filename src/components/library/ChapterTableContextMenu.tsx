/* eslint-disable react/button-has-type */
/* eslint-disable react/display-name */
import React from 'react';
import {
  CaretRightOutlined,
  CheckOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
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
import { customDownloadsDirState } from '../../state/settingStates';

const defaultDownloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
);

const WIDTH = 150;
const HEIGHT = 180;

type Props = {
  location: { x: number; y: number };
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

  if (!props.visible) return <></>;

  const getPreviousChapters = () => {
    return props.chapterList.filter((chapter: Chapter) => {
      return (
        props.chapter !== undefined &&
        parseFloat(chapter.chapterNumber) <
          parseFloat(props.chapter.chapterNumber)
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
      toggleChapterRead(props.chapter, props.series, setChapterList, setSeries);
    }
  };

  const handleMarkPrevious = (read: boolean) => {
    props.close();
    getPreviousChapters().forEach((chapter: Chapter) => {
      if ((read && !chapter.read) || (!read && chapter.read)) {
        toggleChapterRead(chapter, props.series, setChapterList, setSeries);
      }
    });
  };

  // eslint-disable-next-line prefer-const
  let { x, y } = props.location;
  if (props.location.x + WIDTH > window.innerWidth) {
    x = props.location.x - WIDTH;
  }
  if (props.location.y + HEIGHT > window.innerHeight) {
    y = props.location.y - HEIGHT;
  }

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
      <button
        className={styles.button}
        onClick={() => handleMarkPrevious(true)}
      >
        Mark previous read
      </button>
      <button
        className={styles.button}
        onClick={() => handleMarkPrevious(false)}
      >
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
