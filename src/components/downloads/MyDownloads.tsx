import React, { useEffect, useState } from 'react';
import { Badge, Button, Collapse, List, Row, Spin, Tabs } from 'antd';
import { connect, ConnectedProps } from 'react-redux';
import log from 'electron-log';
import { Chapter, Languages, Series } from 'houdoku-extension-lib';
import Paragraph from 'antd/lib/typography/Paragraph';
import styles from './MyDownloads.css';
import { RootState } from '../../store';
import { getDownloadedList } from '../../features/downloader/utils';

const { Panel } = Collapse;

const mapState = (state: RootState) => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const MyDownloads: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<{
    [seriesId: number]: { series: Series; chapters: Chapter[] };
  }>({});

  const loadDownloads = async () => {
    setLoading(true);

    getDownloadedList()
      // eslint-disable-next-line promise/always-return
      .then(({ seriesList, chapterList }) => {
        const tempEntries: {
          [seriesId: number]: { series: Series; chapters: Chapter[] };
        } = {};

        seriesList.forEach((series: Series) => {
          if (series.id !== undefined)
            tempEntries[series.id] = { series, chapters: [] };
        });
        chapterList.forEach((chapter: Chapter) => {
          if (chapter.seriesId !== undefined)
            tempEntries[chapter.seriesId].chapters.push(chapter);
        });

        setEntries(tempEntries);
      })
      .catch((err) => log.error(err))
      .finally(() => setLoading(false))
      .catch((err) => log.error(err));
  };

  useEffect(() => {
    loadDownloads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin />
        <Paragraph>Loading downloads...</Paragraph>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => loadDownloads()}>Refresh Downloads</Button>
      <Collapse className={styles.collapse}>
        {Object.values(entries).map((entry) => (
          <Panel
            header={
              <>
                <Badge count={entry.chapters.length} /> {entry.series.title}
              </>
            }
            key={
              entry.series.id === undefined ? Math.random() : entry.series.id
            }
          >
            <List
              size="small"
              bordered
              dataSource={entry.chapters}
              renderItem={(chapter: Chapter) => {
                const groupStr =
                  chapter.groupName === '' ? '' : ` [${chapter.groupName}]`;

                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div
                          className={`${styles.flag} flag flag-${
                            Languages[chapter.languageKey].flagCode
                          }`}
                        />
                      }
                      title={`Chapter ${chapter.chapterNumber}${groupStr}`}
                    />
                  </List.Item>
                );
              }}
            />
          </Panel>
        ))}
      </Collapse>
    </>
  );
};

export default connector(MyDownloads);
