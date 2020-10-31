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
      defaultSortOrder: 'descend',
      width: '20%',
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
      width: '20%',
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
        return <Button>Read</Button>;
      },
    },
  ];

  return <Table dataSource={dataSource} columns={columns} size="small" />;
};

export default ChapterTable;
