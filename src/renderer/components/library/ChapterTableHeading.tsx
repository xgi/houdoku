import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chapter, Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { CloseButton, Group, Table } from '@mantine/core';
import { IconArrowsSort, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons';
import routes from '@/common/constants/routes.json';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { chapterListVolOrderState, chapterListChOrderState } from '@/renderer/state/settingStates';
import { TableColumnSortOrder } from '@/common/models/types';
import DefaultInput from '../general/DefaultInput';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';
import DefaultActionIcon from '../general/DefaultActionIcon';

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
    <Table.Tr>
      <Table.Th w={40}> </Table.Th>
      <Table.Th w={30}> </Table.Th>
      {currentTextFilter ? (
        <Table.Th colSpan={2}>
          <DefaultInput
            autoFocus
            placeholder={`Filter ${currentTextFilter}...`}
            size="xs"
            rightSectionPointerEvents="all"
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
        </Table.Th>
      ) : (
        <>
          <Table.Th>
            <Group gap={5} wrap="nowrap">
              <DefaultText size="sm" fw={700}>
                Title
              </DefaultText>
              <DefaultActionIcon
                transparent
                size={16}
                onClick={() => setCurrentTextFilter('title')}
              >
                <IconSearch />
              </DefaultActionIcon>
            </Group>
          </Table.Th>
          <Table.Th>
            <Group gap={5} wrap="nowrap">
              <DefaultText size="sm" fw={700}>
                Group
              </DefaultText>
              <DefaultActionIcon
                transparent
                size={16}
                onClick={() => setCurrentTextFilter('group')}
              >
                <IconSearch />
              </DefaultActionIcon>
            </Group>
          </Table.Th>
        </>
      )}
      <Table.Th w={60}>
        <Group justify="center" gap={0} wrap="nowrap">
          <DefaultText size="sm" fw={700}>
            Vol
          </DefaultText>
          <DefaultActionIcon
            oc={chapterListVolOrder === TableColumnSortOrder.None ? undefined : 'blue'}
            transparent
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
          </DefaultActionIcon>
        </Group>
      </Table.Th>
      <Table.Th w={60}>
        <Group justify="center" gap={0} wrap="nowrap">
          <DefaultText size="sm" fw={700}>
            Ch
          </DefaultText>
          <DefaultActionIcon
            oc={chapterListChOrder === TableColumnSortOrder.None ? undefined : 'blue'}
            transparent
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
          </DefaultActionIcon>
        </Group>
      </Table.Th>
      <Table.Th w={100}>
        <Group justify="flex-end">
          {getNextUnreadChapter() ? (
            <Link to={`${routes.READER}/${props.series.id}/${getNextUnreadChapter()?.id}`}>
              <DefaultButton oc="blue" size="xs" fw={700}>
                Continue
              </DefaultButton>
            </Link>
          ) : (
            ''
          )}
        </Group>
      </Table.Th>
    </Table.Tr>
  );
};

export default ChapterTableHeading;
