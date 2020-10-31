import React from 'react';
import { Table } from 'antd';
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
      width: '50%',
    },
    {
      title: 'Volume',
      colSpan: 1,
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
      width: '25%',
      align: 'center',
      sorter: (a: any, b: any) => a.volumeNumber - b.volumeNumber,
    },
    {
      title: 'Chapter',
      colSpan: 1,
      dataIndex: 'chapterNumber',
      key: 'chapterNumber',
      width: '25%',
      align: 'center',
      sorter: (a: any, b: any) => a.chapterNumber - b.chapterNumber,
    },
  ];

  return <Table dataSource={dataSource} columns={columns} />;
};

export default ChapterTable;
