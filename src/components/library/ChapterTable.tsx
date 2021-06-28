/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { Table, Checkbox, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Chapter, Series, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { connect, ConnectedProps } from 'react-redux';
import routes from '../../constants/routes.json';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ChapterTableContextMenu from './ChapterTableContextMenu';
import { getChapterDownloadedSync } from '../../util/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import { RootState } from '../../store';
import { toggleChapterRead } from '../../features/library/utils';

const downloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DOWNLOADS_DIR
);

const mapState = (state: RootState) => ({
  chapterList: state.library.chapterList,
  chapterLanguages: state.settings.chapterLanguages,
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
  currentTask: state.downloader.currentTask,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

type Props = PropsFromRedux & {
  series: Series;
};

const ChapterTable: React.FC<Props> = (props: Props) => {
  const [showingContextMenu, setShowingContextMenu] = useState(false);
  const [contextMenuLocation, setContextMenuLocation] = useState<{
    x: number;
    y: number;
  }>({
    x: 0,
    y: 0,
  });
  const [contextMenuChapter, setContextMenuChapter] =
    useState<Chapter | undefined>();
  const [filterTitle, setFilterTitle] = useState('');
  const [filterGroup, setFilterGroup] = useState('');

  const getFilteredList = () => {
    return props.chapterList.filter(
      (chapter: Chapter) =>
        props.chapterLanguages.includes(chapter.languageKey) &&
        chapter.title.toLowerCase().includes(filterTitle) &&
        chapter.groupName.toLowerCase().includes(filterGroup)
    );
  };

  const getNextUnreadChapter = () => {
    return getFilteredList()
      .sort(
        (a: Chapter, b: Chapter) =>
          parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)
      )
      .find((chapter: Chapter) => !chapter.read);
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: () => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Filter ${dataIndex}...`}
          allowClear
          onChange={(e) =>
            dataIndex === 'title'
              ? setFilterTitle(e.target.value)
              : setFilterGroup(e.target.value)
          }
        />
      </div>
    ),
    filterIcon: () => <SearchOutlined />,
  });

  const columns = [
    {
      title: 'Rd',
      dataIndex: 'read',
      key: 'read',
      width: '5%',
      render: function render(_text: string, record: Chapter) {
        return (
          <Checkbox
            checked={record.read}
            onChange={() => {
              props.toggleChapterRead(record, props.series);
              if (!record.read && props.trackerAutoUpdate) {
                sendProgressToTrackers(record, props.series);
              }
            }}
          />
        );
      },
    },
    {
      title: 'DL',
      dataIndex: 'downloaded',
      key: 'downloaded',
      width: '5%',
      render: function render(_text: string, record: Chapter) {
        return (
          <Checkbox
            checked={getChapterDownloadedSync(
              props.series,
              record,
              downloadsDir
            )}
            disabled
          />
        );
      },
    },
    {
      title: '',
      dataIndex: 'language',
      key: 'language',
      width: '5%',
      render: function render(_text: string, record: Chapter) {
        return Languages[record.languageKey] === undefined ? (
          <></>
        ) : (
          <div
            className={`flag flag-${Languages[record.languageKey].flagCode}`}
          />
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '33%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
      width: '22%',
      ...getColumnSearchProps('groupName'),
    },
    {
      title: 'Vol',
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
      width: '8%',
      align: 'center',
      sorter: {
        compare: (a: Chapter, b: Chapter) =>
          parseFloat(a.volumeNumber) - parseFloat(b.volumeNumber),
        multiple: 2,
      },
    },
    {
      title: 'Ch',
      dataIndex: 'chapterNumber',
      key: 'chapterNumber',
      defaultSortOrder: 'descend',
      width: '7%',
      align: 'center',
      sorter: {
        compare: (a: Chapter, b: Chapter) =>
          parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber),
        multiple: 1,
      },
    },
    {
      title: () => {
        const nextChapter: Chapter | undefined = getNextUnreadChapter();
        if (nextChapter === undefined) return <></>;

        return (
          <Link to={`${routes.READER}/${nextChapter.id}`}>
            <Button type="primary">Continue</Button>
          </Link>
        );
      },
      key: 'readButton',
      width: '15%',
      align: 'center',
      render: function render(_text: string, record: Chapter) {
        return (
          <Link to={`${routes.READER}/${record.id}`}>
            <Button>Read</Button>
          </Link>
        );
      },
    },
  ];

  const filteredList = getFilteredList();
  return (
    <>
      <ChapterTableContextMenu
        location={contextMenuLocation}
        visible={showingContextMenu}
        series={props.series}
        chapter={contextMenuChapter}
        chapterList={filteredList}
        close={() => setShowingContextMenu(false)}
      />
      <Table
        onRow={(record, _rowIndex) => {
          return {
            onClick: () => {
              setShowingContextMenu(false);
            },
            onContextMenu: (event) => {
              setContextMenuLocation({ x: event.clientX, y: event.clientY });
              setContextMenuChapter(record);
              setShowingContextMenu(true);
            },
          };
        }}
        dataSource={filteredList}
        // @ts-expect-error cleanup column render types
        columns={columns}
        rowKey="id"
        size="small"
      />
    </>
  );
};

export default connector(ChapterTable);
