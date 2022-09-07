/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import { TablePaginationConfig } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Chapter, Series, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Group,
  Pagination,
  Select,
  Table,
  Text,
} from '@mantine/core';
import {
  IconArrowsSort,
  IconDownload,
  IconEye,
  IconFileCheck,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons';
import { useForceUpdate } from '@mantine/hooks';
import routes from '../../constants/routes.json';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ChapterTableContextMenu from './ChapterTableContextMenu';
import { getChapterDownloaded } from '../../util/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import { markChapters } from '../../features/library/utils';
import flags from '../../img/flags.png';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  chapterListState,
  seriesState,
} from '../../state/libraryStates';
import {
  chapterLanguagesState,
  trackerAutoUpdateState,
  customDownloadsDirState,
  chapterListVolOrderState,
  chapterListChOrderState,
  chapterListPageSizeState,
} from '../../state/settingStates';
import { TableColumnSortOrder } from '../../models/types';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import { currentTaskState } from '../../state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const columnOrderMap = {
  [TableColumnSortOrder.Ascending]: <IconSortAscending size={16} />,
  [TableColumnSortOrder.Descending]: <IconSortDescending size={16} />,
  [TableColumnSortOrder.None]: <IconArrowsSort size={16} />,
};
const columnOrderReverseMap: { [key: string]: TableColumnSortOrder } = {
  ascend: TableColumnSortOrder.Ascending,
  descend: TableColumnSortOrder.Descending,
};

type Props = {
  series: Series;
};

const ChapterTable: React.FC<Props> = (props: Props) => {
  const setSeries = useSetRecoilState(seriesState);
  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const [chapterFilterTitle, setChapterFilterTitle] = useRecoilState(chapterFilterTitleState);
  const [chapterFilterGroup, setChapterFilterGroup] = useRecoilState(chapterFilterGroupState);
  const [chapterListVolOrder, setChapterListVolOrder] = useRecoilState(chapterListVolOrderState);
  const [chapterListChOrder, setChapterListChOrder] = useRecoilState(chapterListChOrderState);
  const [chapterListPageSize, setChapterListPageSize] = useRecoilState(chapterListPageSizeState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const trackerAutoUpdate = useRecoilValue(trackerAutoUpdateState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const [currentPage, setCurrentPage] = useState(1);
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [contextMenuChapter, setContextMenuChapter] = useState<Chapter | undefined>();
  const forceUpdate = useForceUpdate();
  const downloaderCurrentTask = useRecoilValue(currentTaskState);
  const [sortedFilteredChapterList, setSortedFilteredChapterList] = useState<Chapter[]>([]);

  useEffect(() => {
    if (downloaderCurrentTask?.page === 2) forceUpdate();
  }, [downloaderCurrentTask, forceUpdate]);

  useEffect(() => {
    setSortedFilteredChapterList(
      chapterList
        .filter(
          (chapter: Chapter) =>
            (chapterLanguages.includes(chapter.languageKey) || chapterLanguages.length === 0) &&
            chapter.title !== null &&
            chapter.title.toLowerCase().includes(chapterFilterTitle) &&
            chapter.groupName !== null &&
            chapter.groupName.toLowerCase().includes(chapterFilterGroup)
        )
        .sort((a, b) => {
          const volumeComp = {
            [TableColumnSortOrder.Ascending]:
              parseInt(a.volumeNumber, 10) - parseInt(b.volumeNumber, 10),
            [TableColumnSortOrder.Descending]:
              parseInt(b.volumeNumber, 10) - parseInt(a.volumeNumber, 10),
            [TableColumnSortOrder.None]: 0,
          }[chapterListVolOrder];
          const chapterComp = {
            [TableColumnSortOrder.Ascending]:
              parseInt(a.chapterNumber, 10) - parseInt(b.chapterNumber, 10),
            [TableColumnSortOrder.Descending]:
              parseInt(b.chapterNumber, 10) - parseInt(a.chapterNumber, 10),
            [TableColumnSortOrder.None]: 0,
          }[chapterListChOrder];

          return volumeComp || chapterComp;
        })
    );
  }, [
    chapterList,
    chapterListVolOrder,
    chapterListChOrder,
    chapterFilterGroup,
    chapterFilterTitle,
    chapterLanguages,
  ]);

  const getNextUnreadChapter = () => {
    return sortedFilteredChapterList
      .slice()
      .sort((a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
      .find((chapter: Chapter) => !chapter.read);
  };

  const handleDownload = (chapter: Chapter) => {
    downloaderClient.add([
      {
        chapter,
        series: props.series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      } as DownloadTask,
    ]);
    downloaderClient.start();
  };

  const renderRows = () => {
    const startIndex = (currentPage - 1) * chapterListPageSize;
    return sortedFilteredChapterList
      .slice(startIndex, startIndex + chapterListPageSize)
      .map((chapter) => {
        return (
          <tr
            key={chapter.id}
            onContextMenu={(event) => {
              setContextMenuPosition({ x: event.clientX, y: event.clientY });
              setContextMenuChapter(chapter);
              setShowingContextMenu(true);
            }}
          >
            <td>
              <ActionIcon
                variant="default"
                onClick={() => {
                  markChapters(
                    [chapter],
                    props.series,
                    !chapter.read,
                    setChapterList,
                    setSeries,
                    chapterLanguages
                  );
                  if (!chapter.read && trackerAutoUpdate) {
                    sendProgressToTrackers(chapter, props.series);
                  }
                }}
              >
                {chapter.read ? <IconEye size={16} /> : ''}
              </ActionIcon>
            </td>
            <td>
              {Languages[chapter.languageKey] === undefined ? (
                <></>
              ) : (
                <div className="flag-container">
                  <img
                    src={flags}
                    title={Languages[chapter.languageKey].name}
                    alt={Languages[chapter.languageKey].name}
                    className={`flag flag-${Languages[chapter.languageKey].flagCode}`}
                  />
                </div>
              )}
            </td>
            <td>{chapter.title}</td>
            <td>
              <Text lineClamp={1}>{chapter.groupName}</Text>
            </td>
            <td>
              <Center>{chapter.volumeNumber}</Center>
            </td>
            <td>
              <Center>{chapter.chapterNumber}</Center>
            </td>
            <td>
              <Group position="right" spacing="xs" noWrap>
                <Link to={`${routes.READER}/${props.series.id}/${chapter.id}`}>
                  <Button variant="default" size="xs">
                    Read
                  </Button>
                </Link>

                {getChapterDownloaded(
                  props.series,
                  chapter,
                  customDownloadsDir || defaultDownloadsDir
                ) ? (
                  <ActionIcon disabled>
                    <IconFileCheck size={16} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    variant="default"
                    onClick={() => {
                      handleDownload(chapter);
                    }}
                  >
                    <IconDownload size={16} />
                  </ActionIcon>
                )}
              </Group>
            </td>
          </tr>
        );
      });
  };

  return (
    <>
      <ChapterTableContextMenu
        position={contextMenuPosition}
        visible={showingContextMenu}
        series={props.series}
        chapter={contextMenuChapter}
        chapterList={sortedFilteredChapterList}
        close={() => setShowingContextMenu(false)}
      />

      <Table>
        <thead>
          <tr>
            <th> </th>
            <th> </th>
            <th>Title</th>
            <th>Group</th>
            <th>
              <Group position="center" spacing={0} noWrap>
                <Text>Vol</Text>
                <ActionIcon
                  color={chapterListVolOrder === TableColumnSortOrder.None ? undefined : 'blue'}
                  variant="transparent"
                  onClick={() => {
                    switch (chapterListVolOrder) {
                      case TableColumnSortOrder.Descending:
                        setChapterListVolOrder(TableColumnSortOrder.Ascending);
                        break;
                      case TableColumnSortOrder.Ascending:
                        setChapterListVolOrder(TableColumnSortOrder.None);
                        break;
                      default:
                        setChapterListVolOrder(TableColumnSortOrder.Descending);
                    }
                  }}
                >
                  {columnOrderMap[chapterListVolOrder]}
                </ActionIcon>
              </Group>
            </th>
            <th>
              <Group position="center" spacing={0} noWrap>
                <Text>Ch</Text>
                <ActionIcon
                  color={chapterListChOrder === TableColumnSortOrder.None ? undefined : 'blue'}
                  variant="transparent"
                  onClick={() => {
                    switch (chapterListChOrder) {
                      case TableColumnSortOrder.Descending:
                        setChapterListChOrder(TableColumnSortOrder.Ascending);
                        break;
                      case TableColumnSortOrder.Ascending:
                        setChapterListChOrder(TableColumnSortOrder.None);
                        break;
                      default:
                        setChapterListChOrder(TableColumnSortOrder.Descending);
                    }
                  }}
                >
                  {columnOrderMap[chapterListChOrder]}
                </ActionIcon>
              </Group>
            </th>
            <th>
              <Group position="right">
                {getNextUnreadChapter() ? (
                  <Link to={`${routes.READER}/${props.series.id}/${getNextUnreadChapter()?.id}`}>
                    <Button size="xs">Continue</Button>
                  </Link>
                ) : (
                  ''
                )}
              </Group>
            </th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>

      <Divider mb="sm" />

      <Group position="right" spacing="md" mb="xl">
        <Pagination
          size="sm"
          page={currentPage}
          onChange={setCurrentPage}
          total={Math.ceil(sortedFilteredChapterList.length / chapterListPageSize)}
        />
        <Select
          size="xs"
          value={`${chapterListPageSize}`}
          data={[10, 20, 50, 100].map((x) => ({ value: `${x}`, label: `${x}/page` }))}
          onChange={(value: string) => setChapterListPageSize(parseInt(value, 10))}
          style={{ width: 90 }}
        />
      </Group>
    </>
  );
};

export default ChapterTable;
