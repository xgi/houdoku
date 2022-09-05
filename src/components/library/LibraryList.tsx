import React from 'react';
import { Series } from 'houdoku-extension-lib';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { ActionIcon, Badge, Button, Group, Table, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { goToSeries } from '../../features/library/utils';
import { seriesListState } from '../../state/libraryStates';

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryList: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const setSeriesList = useSetRecoilState(seriesListState);

  const viewFunc = (series: Series) => {
    goToSeries(series, setSeriesList, history);
  };

  const renderRows = () => {
    return props.getFilteredList().map((series) => {
      return (
        <tr>
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
            <Group spacing="xs" position="right">
              <Button onClick={() => viewFunc(series)}>View</Button>
              <ActionIcon
                variant="filled"
                color="red"
                size="lg"
                onClick={() => props.showRemoveModal(series)}
              >
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
