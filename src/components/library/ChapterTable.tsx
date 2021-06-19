/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { Table, Checkbox, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Chapter, Series, Languages, LanguageKey } from 'houdoku-extension-lib';
import routes from '../../constants/routes.json';
import { sendProgressToTrackers } from '../../features/tracker/utils';

type Props = {
  chapterList: Chapter[];
  series: Series;
  chapterLanguages: LanguageKey[];
  toggleChapterRead: (chapter: Chapter, series: Series) => void;
};

const ChapterTable: React.FC<Props> = (props: Props) => {
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
      title: 'Read',
      dataIndex: 'read',
      key: 'read',
      width: '5%',
      render: function render(_text: string, record: Chapter) {
        return (
          <Checkbox
            checked={record.read}
            onChange={() => {
              props.toggleChapterRead(record, props.series);
              if (!record.read) {
                sendProgressToTrackers(record, props.series);
              }
            }}
          />
        );
      },
    },
    {
      title: '',
      dataIndex: 'language',
      key: 'language',
      width: '6%',
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
      width: '35%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Group',
      dataIndex: 'groupName',
      key: 'groupName',
      width: '15%',
      ...getColumnSearchProps('groupName'),
    },
    {
      title: 'Volume',
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
      width: '12%',
      align: 'center',
      sorter: {
        compare: (a: Chapter, b: Chapter) =>
          parseFloat(a.volumeNumber) - parseFloat(b.volumeNumber),
        multiple: 2,
      },
    },
    {
      title: 'Chapter',
      dataIndex: 'chapterNumber',
      key: 'chapterNumber',
      defaultSortOrder: 'descend',
      width: '12%',
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

  return (
    <Table
      dataSource={getFilteredList()}
      // @ts-expect-error cleanup column render types
      columns={columns}
      rowKey="id"
      size="small"
    />
  );
};

export default ChapterTable;
