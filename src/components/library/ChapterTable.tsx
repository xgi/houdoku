/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { Table, Checkbox, Button, Input, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Chapter, Series, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import { connect, ConnectedProps } from 'react-redux';
import routes from '../../constants/routes.json';
import { sendProgressToTrackers } from '../../features/tracker/utils';
import ChapterTableContextMenu from './ChapterTableContextMenu';
import { getChapterDownloaded } from '../../util/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import { RootState } from '../../store';
import { toggleChapterRead } from '../../features/library/utils';
import {
  setChapterFilterGroup,
  setChapterFilterTitle,
} from '../../features/library/actions';
import { useForceUpdate } from '../../util/reactutil';
import flags from '../../img/flags.png';

const defaultDownloadsDir = await ipcRenderer.invoke(
  ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
);

const mapState = (state: RootState) => ({
  chapterList: state.library.chapterList,
  chapterFilterTitle: state.library.chapterFilterTitle,
  chapterFilterGroup: state.library.chapterFilterGroup,
  chapterLanguages: state.settings.chapterLanguages,
  trackerAutoUpdate: state.settings.trackerAutoUpdate,
  customDownloadsDir: state.settings.customDownloadsDir,
  currentTask: state.downloader.currentTask,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  toggleChapterRead: (chapter: Chapter, series: Series) =>
    toggleChapterRead(dispatch, chapter, series),
  setChapterFilterTitle: (value: string) =>
    dispatch(setChapterFilterTitle(value)),
  setChapterFilterGroup: (value: string) =>
    dispatch(setChapterFilterGroup(value)),
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
  const [contextMenuChapter, setContextMenuChapter] = useState<
    Chapter | undefined
  >();
  const forceUpdate = useForceUpdate();

  const getFilteredChapterList = () => {
    return props.chapterList.filter(
      (chapter: Chapter) =>
        (props.chapterLanguages.includes(chapter.languageKey) ||
          props.chapterLanguages.length === 0) &&
        chapter.title.toLowerCase().includes(props.chapterFilterTitle) &&
        chapter.groupName.toLowerCase().includes(props.chapterFilterGroup)
    );
  };

  const getNextUnreadChapter = () => {
    return getFilteredChapterList()
      .sort(
        (a: Chapter, b: Chapter) =>
          parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)
      )
      .find((chapter: Chapter) => !chapter.read);
  };

  const getColumnSearchProps = (dataIndex: string) => {
    const localSetChapterFilterTitle = props.setChapterFilterTitle;
    const localSetChapterFilterGroup = props.setChapterFilterGroup;

    return {
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Filter ${dataIndex}...`}
            allowClear
            autoFocus
            onChange={(e) => {
              if (dataIndex === 'title') {
                localSetChapterFilterTitle(e.target.value);
              } else {
                localSetChapterFilterGroup(e.target.value);
              }
              forceUpdate();
            }}
          />
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
    };
  };

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
            checked={getChapterDownloaded(
              props.series,
              record,
              props.customDownloadsDir || defaultDownloadsDir
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
          <div className="flag-container">
            <img
              src={flags}
              title={Languages[record.languageKey].name}
              className={`flag flag-${Languages[record.languageKey].flagCode}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
      width: '17%',
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
          <Link to={`${routes.READER}/${props.series.id}/${nextChapter.id}`}>
            <Button type="primary">Continue</Button>
          </Link>
        );
      },
      key: 'readButton',
      width: '15%',
      align: 'center',
      render: function render(_text: string, record: Chapter) {
        return (
          <Link to={`${routes.READER}/${props.series.id}/${record.id}`}>
            <Button>Read</Button>
          </Link>
        );
      },
    },
  ];

  const filteredList = getFilteredChapterList();
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
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>
                  No Chapters Found
                  <br />
                  You may need to adjust the &quot;Chapter Languages&quot;
                  option in the Settings tab.
                </span>
              }
            />
          ),
        }}
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
