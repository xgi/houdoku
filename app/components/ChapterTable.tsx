import React from 'react';
import { Table, Checkbox, Button } from 'antd';
import Series from '../models/series';
import Chapter from '../models/chapter';
import { setChapterRead } from '../library/actions';

type Props = {
  chapterList: Chapter[];
  setChapterRead: (chapter: Chapter, read: boolean) => void;
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

  const updateChapterRead = (key: string) => {
    const chapter: Chapter | undefined = props.chapterList.find(
      (c) => c.uuid === key
    );
    if (chapter) {
      console.log(props.setChapterRead);
      props.setChapterRead(chapter, true);
    }
    // reloadDataSource();
  };

  const columns = [
    {
      title: 'Read',
      dataIndex: 'read',
      key: 'read',
      width: '5%',
      render: function render(text: any, record: any) {
        return (
          <Checkbox
            checked={record.read}
            onChange={() => updateChapterRead(record.uuid)}
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
      width: '15%',
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
      width: '15%',
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

  // reloadDataSource();
  return (
    <Table dataSource={props.chapterList} columns={columns} size="small" />
  );
};

export default ChapterTable;
