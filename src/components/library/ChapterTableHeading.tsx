/* eslint-disable react/display-name */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chapter, Series } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Button, CloseButton, Group, Input, Text } from '@mantine/core';
import { IconArrowsSort, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons';
import routes from '../../constants/routes.json';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  sortedFilteredChapterListState,
} from '../../state/libraryStates';
import { chapterListVolOrderState, chapterListChOrderState } from '../../state/settingStates';
import { TableColumnSortOrder } from '../../models/types';

const columnOrderMap = {
  [TableColumnSortOrder.Ascending]: <IconSortAscending size={16} />,
  [TableColumnSortOrder.Descending]: <IconSortDescending size={16} />,
  [TableColumnSortOrder.None]: <IconArrowsSort size={16} />,
};

type Props = {
  series: Series;
};

const ChapterTableHeading: React.FC<Props> = (props: Props) => {
  const setChapterFilterTitle = useSetRecoilState(chapterFilterTitleState);
  const setChapterFilterGroup = useSetRecoilState(chapterFilterGroupState);
  const [chapterListVolOrder, setChapterListVolOrder] = useRecoilState(chapterListVolOrderState);
  const [chapterListChOrder, setChapterListChOrder] = useRecoilState(chapterListChOrderState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const [currentTextFilter, setCurrentTextFilter] = useState<'title' | 'group' | null>(null);

  const getNextUnreadChapter = () => {
    return sortedFilteredChapterList
      .slice()
      .sort((a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
      .find((chapter: Chapter) => !chapter.read);
  };

  return (
    <tr>
      <th> </th>
      <th> </th>
      {currentTextFilter ? (
        <th colSpan={2}>
          <Input
            autoFocus
            placeholder={`Filter ${currentTextFilter}...`}
            size="xs"
            rightSection={
              <CloseButton
                onClick={() => {
                  setCurrentTextFilter(null);
                  setChapterFilterTitle('');
                  setChapterFilterGroup('');
                }}
              />
            }
            onChange={(value: React.ChangeEvent<HTMLInputElement>) => {
              if (currentTextFilter === 'title') setChapterFilterTitle(value.target.value);
              if (currentTextFilter === 'group') setChapterFilterGroup(value.target.value);
            }}
          />
        </th>
      ) : (
        <th>
          <Group position="center" spacing={5} noWrap>
            <Text>Title</Text>
            <ActionIcon
              variant="transparent"
              size={16}
              onClick={() => setCurrentTextFilter('title')}
            >
              <IconSearch />
            </ActionIcon>
          </Group>
        </th>
      )}
      {currentTextFilter ? (
        ''
      ) : (
        <th>
          <Group position="center" spacing={5} noWrap>
            <Text>Group</Text>
            <ActionIcon
              variant="transparent"
              size={16}
              onClick={() => setCurrentTextFilter('group')}
            >
              <IconSearch />
            </ActionIcon>
          </Group>
        </th>
      )}
      <th>
        <Group position="center" spacing={0} noWrap>
          <Text>Vol</Text>
          <ActionIcon
            color={chapterListVolOrder === TableColumnSortOrder.None ? undefined : 'blue'}
            variant="transparent"
            onClick={() => {
              switch (chapterListVolOrder) {
                case TableColumnSortOrder.Descending:
                  setChapterListVolOrder(TableColumnSortOrder.Ascending);
                  break;
                case TableColumnSortOrder.Ascending:
                  setChapterListVolOrder(TableColumnSortOrder.None);
                  break;
                default:
                  setChapterListVolOrder(TableColumnSortOrder.Descending);
              }
            }}
          >
            {columnOrderMap[chapterListVolOrder]}
          </ActionIcon>
        </Group>
      </th>
      <th>
        <Group position="center" spacing={0} noWrap>
          <Text>Ch</Text>
          <ActionIcon
            color={chapterListChOrder === TableColumnSortOrder.None ? undefined : 'blue'}
            variant="transparent"
            onClick={() => {
              switch (chapterListChOrder) {
                case TableColumnSortOrder.Descending:
                  setChapterListChOrder(TableColumnSortOrder.Ascending);
                  break;
                case TableColumnSortOrder.Ascending:
                  setChapterListChOrder(TableColumnSortOrder.None);
                  break;
                default:
                  setChapterListChOrder(TableColumnSortOrder.Descending);
              }
            }}
          >
            {columnOrderMap[chapterListChOrder]}
          </ActionIcon>
        </Group>
      </th>
      <th>
        <Group position="right">
          {getNextUnreadChapter() ? (
            <Link to={`${routes.READER}/${props.series.id}/${getNextUnreadChapter()?.id}`}>
              <Button size="xs">Continue</Button>
            </Link>
          ) : (
            ''
          )}
        </Group>
      </th>
    </tr>
  );
};

export default ChapterTableHeading;
