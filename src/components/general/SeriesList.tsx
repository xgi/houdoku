import React from 'react';
import { Button, Tag, Table } from 'antd';
import { Series, SeriesStatus } from 'houdoku-extension-lib';
import { LibrarySort, ProgressFilter } from '../../models/types';

type Props = {
  seriesList: Series[];
  sorted: boolean;
  filter: string;
  filterStatus: SeriesStatus | null;
  filterProgress: ProgressFilter;
  librarySort: LibrarySort;
  clickFunc: (series: Series, inLibrary: boolean | undefined) => void;
  inLibraryFunc: ((series: Series) => boolean) | undefined;
};

const SeriesList: React.FC<Props> = (props: Props) => {
  /**
   * Get a filtered (and sorted) list of series after applying the specified filters.
   * @param seriesList the list of series to filter
   * @returns a sorted list of series matching all filter props
   */
  const getFilteredList = (seriesList: Series[]): Series[] => {
    const filter = props.filter.toLowerCase();

    const filteredList = seriesList.filter((series: Series) => {
      if (!series) return false;

      if (!series.title.toLowerCase().includes(filter)) return false;
      if (props.filterStatus !== null && series.status !== props.filterStatus) {
        return false;
      }
      if (
        props.filterProgress === ProgressFilter.Unread &&
        series.numberUnread === 0
      ) {
        return false;
      }
      if (
        props.filterProgress === ProgressFilter.Finished &&
        series.numberUnread > 0
      ) {
        return false;
      }

      return true;
    });

    switch (props.librarySort) {
      case LibrarySort.UnreadAsc:
        return filteredList.sort(
          (a: Series, b: Series) => a.numberUnread - b.numberUnread
        );
      case LibrarySort.UnreadDesc:
        return filteredList.sort(
          (a: Series, b: Series) => b.numberUnread - a.numberUnread
        );
      case LibrarySort.TitleAsc:
        return filteredList.sort((a: Series, b: Series) =>
          a.title.localeCompare(b.title)
        );
      case LibrarySort.TitleDesc:
        return filteredList.sort((a: Series, b: Series) =>
          b.title.localeCompare(a.title)
        );
    }
  };

  const listColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Unread',
      dataIndex: 'numberUnread',
      key: 'numberUnread',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Author(s)',
      key: 'authors',
      render: (series: any) => {
        return series.authors.map((author: any) => (
          <Tag key={author}>{author}</Tag>
        ));
      },
    },
    {
      title: '',
      key: 'title',
      render: (series: any) => {
        const inLibrary: boolean | undefined =
          props.inLibraryFunc === undefined
            ? undefined
            : props.inLibraryFunc(series);

        return (
          <Button
            onClick={() => props.clickFunc(series, inLibrary)}
            type="primary"
            key={series}
          >
            Continue
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={listColumns}
        dataSource={getFilteredList(props.seriesList)}
        rowKey="id"
      />
    </>
  );
};

export default SeriesList;
