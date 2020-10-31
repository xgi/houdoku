import React from 'react';
import { Table, Space, Button } from 'antd';
import Series from '../models/series';
import Chapter from '../models/chapter';

type Props = {
  chapterList: Chapter[];
};

const ChapterTable: React.FC<Props> = (props: Props) => {
  const dataSource = props.chapterList.map((chapter: Chapter) => ({
    key: chapter.uuid,
    title: chapter.title,
    volumeNumber: chapter.volumeNumber,
    chapterNumber: chapter.chapterNumber,
  }));

  const columns = [
    {
      title: 'Chapter Title',
      dataIndex: 'title',
      key: 'title',
      width: '45%',
      ellipsis: true,
    },
    {
      title: 'Volume',
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
      width: '20%',
      align: 'center',
      sorter: (a: any, b: any) => a.volumeNumber - b.volumeNumber,
    },
    {
      title: 'Chapter',
      dataIndex: 'chapterNumber',
      key: 'chapterNumber',
      width: '20%',
      align: 'center',
      sorter: (a: any, b: any) => a.chapterNumber - b.chapterNumber,
    },
    {
      title: '',
      key: 'readButton',
      width: '15%',
      align: 'center',
      render: function render(text: any, record: any) {
        return <Button>Read</Button>;
      },
    },
  ];

  return <Table dataSource={dataSource} columns={columns} size="small" />;
};

export default ChapterTable;
