import React, { useEffect, useState } from 'react';
import { Button, Modal, Row, Tree } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import log from 'electron-log';
import { Chapter, Languages, Series } from 'houdoku-extension-lib';
import styles from './MyDownloads.css';
import { RootState } from '../../store';
import { getDownloadedList } from '../../features/downloader/utils';
import { deleteDownloadedChapter } from '../../util/filesystem';
import { setStatusText } from '../../features/statusbar/actions';

const { confirm } = Modal;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const MyDownloads: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const [cacheSeriesList, setCacheSeriesList] = useState<Series[]>([]);
  const [cacheChapterList, setCacheChapterList] = useState<Chapter[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);

  const loadDownloads = async () => {
    setLoading(true);

    getDownloadedList()
      // eslint-disable-next-line promise/always-return
      .then(({ seriesList, chapterList }) => {
        const tempTreeData = seriesList.map((series) => {
          const chapters = chapterList.filter(
            (chapter) => chapter.seriesId === series.id
          );

          return {
            title: series.title,
            key: `series-${series.id}`,
            children: chapters.map((chapter) => {
              const groupStr =
                chapter.groupName === '' ? '' : ` [${chapter.groupName}]`;

              return {
                title: (
                  <>
                    <div
                      className={`${styles.flag} flag flag-${
                        Languages[chapter.languageKey].flagCode
                      }`}
                    />
                    Chapter {chapter.chapterNumber}
                    {groupStr}
                  </>
                ),
                key: `chapter-${chapter.id}`,
              };
            }),
          };
        });

        setTreeData(tempTreeData);
        setCacheChapterList(chapterList);
        setCacheSeriesList(seriesList);
      })
      .catch((err) => log.error(err))
      .finally(() => setLoading(false))
      .catch((err) => log.error(err));
  };

  const deleteSelected = async () => {
    const count = checkedChapters.length;
    log.debug(`Prompting to delete ${count} downloaded chapters`);

    confirm({
      title: 'Delete the selected chapters?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible.',
      onOk() {
        Promise.all(
          checkedChapters.map(async (key: string) => {
            const chapterIdStr = key.split('-').pop();
            if (chapterIdStr === undefined) return;
            const chapterId = parseInt(chapterIdStr, 10);

            const chapter = cacheChapterList.find((c) => c.id === chapterId);
            if (chapter === undefined || chapter.seriesId === undefined) return;
            const series = cacheSeriesList.find(
              (s) => s.id === chapter.seriesId
            );
            if (series === undefined) return;

            await deleteDownloadedChapter(series, chapter);
          })
        )
          // eslint-disable-next-line promise/always-return
          .then(() => {
            props.setStatusText(`Deleted ${count} downloaded chapter(s)`);
            loadDownloads();
          })
          .catch((err) => log.error(err));
      },
    });
  };

  useEffect(() => {
    loadDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row className={styles.controlRow}>
        <Button
          className={styles.refreshButton}
          onClick={() => loadDownloads()}
        >
          {loading ? <SyncOutlined spin /> : 'Refresh Downloads'}
        </Button>
        <Button type="primary" danger onClick={() => deleteSelected()}>
          Delete Selected
        </Button>
      </Row>
      {treeData.length > 0 ? (
        <Tree
          checkable
          selectable={false}
          onCheck={(keys: any) =>
            setCheckedChapters(
              keys.filter((key: string) => key.startsWith('chapter-'))
            )
          }
          treeData={treeData}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default connector(MyDownloads);
