import React from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Badge, Button, Group, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { goToSeries, removeSeries } from '@/renderer/features/library/utils';
import { seriesListState } from '@/renderer/state/libraryStates';
import { confirmRemoveSeriesState } from '@/renderer/state/settingStates';

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryList: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const setSeriesList = useSetRecoilState(seriesListState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);

  const viewFunc = (series: Series) => {
    goToSeries(series, setSeriesList, navigate);
  };

  const removeFunc = (series: Series) => {
    if (series) {
      if (confirmRemoveSeries) {
        props.showRemoveModal(series);
      } else {
        removeSeries(series, setSeriesList);
      }
    }
  };

  const renderRows = () => {
    return props.getFilteredList().map((series) => {
      return (
        <tr key={`${series.id}-${series.title}`}>
          <td>
            {series.numberUnread > 0 ? <Badge color="violet">{series.numberUnread}</Badge> : ''}{' '}
            {series.title}
          </td>
          <td>{series.status}</td>
          <td>
            {series.authors.slice(0, 3).map((author) => (
              <Text key={author}>{author}</Text>
            ))}
          </td>
          <td>
            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <Button onClick={() => viewFunc(series)}>View</Button>
              <ActionIcon variant="filled" color="red" size="lg" onClick={() => removeFunc(series)}>
                <IconTrash size={20} />
              </ActionIcon>
            </Group>
          </td>
        </tr>
      );
    });
  };

  return (
    <Table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Author</th>
          <th> </th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};

export default LibraryList;
