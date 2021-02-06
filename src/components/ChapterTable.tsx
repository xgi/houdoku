/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { Table, Checkbox, Button, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Chapter, Language, LanguageKey, Series } from '../models/types';
import routes from '../constants/routes.json';
import { Languages } from '../models/languages';
import db from '../services/db';

type Props = {
  chapterList: Chapter[];
  series: Series;
  loadChapterList: (seriesId: number) => void;
};

let searchInput: Input | null;

const ChapterTable: React.FC<Props> = (props: Props) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
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

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: string, record: any) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput?.select(), 100);
      }
    },
  });

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
            onChange={() => {
              const chapter: Chapter = { ...record, read: !record.read };
              return db.addChapters([chapter], props.series).then(() => {
                // eslint-disable-next-line promise/always-return
                if (props.series.id !== undefined)
                  props.loadChapterList(props.series.id);
              });
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
      filters: Object.values(Languages).map((language: Language) => {
        return { text: language.name, value: language.key };
      }),
      onFilter: (value: LanguageKey, record: any) =>
        record.languageKey === value,
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
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Volume',
      dataIndex: 'volumeNumber',
      key: 'volumeNumber',
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
