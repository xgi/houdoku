import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chapter, Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Button, CloseButton, Group, Table, Text, TextInput } from '@mantine/core';
import { IconArrowsSort, IconSearch, IconSortAscending, IconSortDescending } from '@tabler/icons';
import routes from '@/common/constants/routes.json';
import {
  chapterFilterGroupState,
  chapterFilterTitleState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { chapterListVolOrderState, chapterListChOrderState } from '@/renderer/state/settingStates';
import { TableColumnSortOrder } from '@/common/models/types';

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
          <TextInput
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
        </Table.Th>
      ) : (
        <>
          <Table.Th>
            <Group gap={5} wrap="nowrap">
              <Text size="sm" fw={700}>
                Title
              </Text>
              <ActionIcon
                c="gray.3"
                variant="transparent"
                size={16}
                onClick={() => setCurrentTextFilter('title')}
              >
                <IconSearch />
              </ActionIcon>
            </Group>
          </Table.Th>
          <Table.Th>
            <Group gap={5} wrap="nowrap">
              <Text size="sm" fw={700}>
                Group
              </Text>
              <ActionIcon
                c="gray.3"
                variant="transparent"
                size={16}
                onClick={() => setCurrentTextFilter('group')}
              >
                <IconSearch />
              </ActionIcon>
            </Group>
          </Table.Th>
        </>
      )}
      <Table.Th w={60}>
        <Group justify="center" gap={0} wrap="nowrap">
          <Text size="sm" fw={700}>
            Vol
          </Text>
          <ActionIcon
            c={chapterListVolOrder === TableColumnSortOrder.None ? 'gray.3' : 'blue'}
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
      </Table.Th>
      <Table.Th w={60}>
        <Group justify="center" gap={0} wrap="nowrap">
          <Text size="sm" fw={700}>
            Ch
          </Text>
          <ActionIcon
            c={chapterListChOrder === TableColumnSortOrder.None ? 'gray.3' : 'blue'}
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
      </Table.Th>
      <Table.Th w={100}>
        <Group justify="flex-end">
          {getNextUnreadChapter() ? (
            <Link to={`${routes.READER}/${props.series.id}/${getNextUnreadChapter()?.id}`}>
              <Button size="xs" fw={700}>
                Continue
              </Button>
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
