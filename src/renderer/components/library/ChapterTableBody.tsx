/* eslint-disable react/display-name */
import React from 'react';
import { Chapter, Series } from '@tiyo/common';
import { useRecoilValue } from 'recoil';
import { sortedFilteredChapterListState } from '../../state/libraryStates';
import { chapterListPageSizeState } from '../../state/settingStates';
import ChapterTableRow from './ChapterTableRow';

type Props = {
  series: Series;
  page: number;
  handleContextMenu: (
    event: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
    chapter: Chapter
  ) => void;
};

const ChapterTableBody: React.FC<Props> = (props: Props) => {
  const chapterListPageSize = useRecoilValue(chapterListPageSizeState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);

  const renderRows = () => {
    const startIndex = (props.page - 1) * chapterListPageSize;
    const curChapterList = sortedFilteredChapterList.slice(
      startIndex,
      startIndex + chapterListPageSize
    );

    return curChapterList.map((chapter) => {
      if (!chapter.id) return '';

      return (
        <ChapterTableRow
          key={chapter.id}
          series={props.series}
          chapter={chapter}
          handleContextMenu={(e) => props.handleContextMenu(e, chapter)}
        />
      );
    });
  };

  return <>{renderRows()}</>;
};

export default ChapterTableBody;
