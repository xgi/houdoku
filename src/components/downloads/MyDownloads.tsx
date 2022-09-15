import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Row, Tree, Typography } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import log from 'electron-log';
import { Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import styles from './MyDownloads.css';
import { getDownloadedList } from '../../features/downloader/utils';
import { deleteDownloadedChapter } from '../../util/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import library from '../../services/library';
import flags from '../../img/flags.png';
import { customDownloadsDirState } from '../../state/settingStates';

const { Text } = Typography;
const { confirm } = Modal;

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const MyDownloads: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [checkedChapters, setCheckedChapters] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);

  const loadDownloads = async () => {
    const downloadedList = getDownloadedList(customDownloadsDir || defaultDownloadsDir);
    const tempTreeData = downloadedList.seriesList.map((series) => {
      if (series.id === undefined) return {};

      return {
        title: `${series.title} [id:${series.id}]`,
        key: `series-${series.id}`,
        children: downloadedList.chapterLists[series.id]
          .sort((a, b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
          .reverse()
          .map((chapter) => {
            const groupStr = chapter.groupName === '' ? '' : ` [${chapter.groupName}]`;

            return {
              title: (
                <>
                  <div className="flag-container" style={{ display: 'inline-block' }}>
                    <img
                      src={flags}
                      title={Languages[chapter.languageKey].name}
                      alt={Languages[chapter.languageKey].name}
                      className={`flag flag-${Languages[chapter.languageKey].flagCode}`}
                    />
                  </div>
                  <span style={{ paddingLeft: 4 }}>
                    Chapter {chapter.chapterNumber}
                    {groupStr} [id:{chapter.id}]
                  </span>
                </>
              ),
              key: `${series.id};${chapter.id}`,
            };
          }),
      };
    });

    setTreeData(tempTreeData);
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

            await deleteDownloadedChapter(
              series,
              chapter,
              customDownloadsDir || defaultDownloadsDir
            );
          })
        )
          // eslint-disable-next-line promise/always-return
          .then(() => {
            setCheckedChapters([]);
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
      <Alert
        className={styles.infoAlert}
        type="info"
        message={
          <>
            You can download chapters for offline reading from the series page in your library. Your
            downloaded chapters are saved in{' '}
            <Text code>
              <a
                href={`file:///${customDownloadsDir || defaultDownloadsDir}`}
                target="_blank"
                rel="noreferrer"
              >
                {customDownloadsDir || defaultDownloadsDir}
              </a>
            </Text>
          </>
        }
      />
      <Row className={styles.controlRow}>
        <Button className={styles.refreshButton} onClick={() => loadDownloads()}>
          {loading ? <SyncOutlined spin /> : 'Refresh List'}
        </Button>
        {checkedChapters.length > 0 ? (
          <Button type="primary" danger onClick={() => deleteSelected()}>
            Delete Selected
          </Button>
        ) : (
          ''
        )}
      </Row>
      {treeData.length > 0 ? (
        <Tree
          checkable
          selectable={false}
          onCheck={(keys: any) =>
            setCheckedChapters(keys.filter((key: string) => !key.startsWith('series-')))
          }
          treeData={treeData}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default MyDownloads;
