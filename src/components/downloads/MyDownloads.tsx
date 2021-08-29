import React, { useEffect, useState } from 'react';
import { Button, Modal, Row, Tree, Typography } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import log from 'electron-log';
import { Chapter, Languages, Series } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import styles from './MyDownloads.css';
import { RootState } from '../../store';
import { getDownloadedList } from '../../features/downloader/utils';
import { deleteDownloadedChapter } from '../../util/filesystem';
import { setStatusText } from '../../features/statusbar/actions';
import ipcChannels from '../../constants/ipcChannels.json';
import library from '../../services/library';

const { Text, Paragraph } = Typography;
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
  const [downloadsDir, setDownloadsDir] = useState('');
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);

  const loadDownloads = async () => {
    setLoading(true);

    setDownloadsDir(
      await ipcRenderer.invoke(ipcChannels.GET_PATH.DOWNLOADS_DIR)
    );

    getDownloadedList()
      // eslint-disable-next-line promise/always-return
      .then(({ seriesList, chapterLists }) => {
        const tempTreeData = seriesList.map((series) => {
          if (series.id === undefined) return {};

          return {
            title: `${series.title} [id:${series.id}]`,
            key: `series-${series.id}`,
            children: chapterLists[series.id].map((chapter) => {
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
                    {groupStr} [id:{chapter.id}]
                  </>
                ),
                key: `${series.id};${chapter.id}`,
              };
            }),
          };
        });

        setTreeData(tempTreeData);
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
            const seriesId = key.split(';')[0];
            const chapterId = key.split(';')[1];

            const series = library.fetchSeries(seriesId);
            const chapter = library.fetchChapter(seriesId, chapterId);
            if (series === null || chapter === null) return;

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
      <Paragraph>
        Your downloaded chapters are saved in{' '}
        <Text code>
          <a href={`file:///${downloadsDir}`} target="_blank" rel="noreferrer">
            {downloadsDir}
          </a>
        </Text>
      </Paragraph>
      {treeData.length > 0 ? (
        <Tree
          checkable
          selectable={false}
          onCheck={(keys: any) =>
            setCheckedChapters(
              keys.filter((key: string) => !key.startsWith('series-'))
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
