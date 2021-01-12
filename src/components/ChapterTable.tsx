import React from 'react';
import { Table, Checkbox, Button } from 'antd';
import { Link } from 'react-router-dom';
import { Chapter } from '../models/types';
import routes from '../constants/routes.json';
import { Languages } from '../models/languages';

type Props = {
  chapterList: Chapter[];
};

const ChapterTable: React.FC<Props> = (props: Props) => {
  // let dataSource: any[] = [];

  // const reloadDataSource = () => {
  //   dataSource = props.chapterList.map((chapter: Chapter) => ({
  //     key: chapter.uuid,
  //     read: chapter.read,
  //     title: chapter.title,
  //     volumeNumber: chapter.volumeNumber,
  //     chapterNumber: chapter.chapterNumber,
  //   }));
  // };

  const columns = [
    {
      title: 'Read',
      dataIndex: 'read',
      key: 'read',
      width: '5%',
      render: function render(text: any, record: any) {
        return <Checkbox checked={false} />;
      },
    },
    {
      title: '',
      dataIndex: 'language',
      key: 'language',
      width: '6%',
      render: function render(text: any, record: any) {
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
      width: '50%',
    },
    {
      title: 'Volume',
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
      defaultSortOrder: 'descend',
      width: '12%',
      align: 'center',
      sorter: {
        compare: (a: any, b: any) => a.volumeNumber - b.volumeNumber,
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
        compare: (a: any, b: any) => a.chapterNumber - b.chapterNumber,
        multiple: 1,
      },
    },
    {
      title: '',
      key: 'readButton',
      width: '15%',
      align: 'center',
      render: function render(text: any, record: any) {
        return (
          <Link to={`${routes.READER}/${record.id}`}>
            <Button>Read</Button>
          </Link>
        );
      },
    },
  ];

  // reloadDataSource();
  return (
    <Table
      dataSource={props.chapterList}
      columns={columns}
      rowKey="id"
      size="small"
    />
  );
};

export default ChapterTable;
