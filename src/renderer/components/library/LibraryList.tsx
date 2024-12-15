import React from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { Badge, Group, Table } from '@mantine/core';
import { goToSeries } from '@/renderer/features/library/utils';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryList: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();

  const viewFunc = (series: Series) => {
    goToSeries(series, navigate);
  };

  const renderRows = () => {
    return props.getFilteredList().map((series) => {
      return (
        <tr key={`${series.id}-${series.title}`}>
          <td>
            <DefaultText size="sm">
              {series.numberUnread > 0 ? <Badge color="violet">{series.numberUnread}</Badge> : ''}{' '}
              {series.title}
            </DefaultText>
          </td>
          <td>
            <DefaultText size="sm">{series.status}</DefaultText>
          </td>
          <td>
            {series.authors.slice(0, 3).map((author) => (
              <DefaultText key={author} size="sm">
                {author}
              </DefaultText>
            ))}
          </td>
          <td>
            <Group gap="xs" justify="flex-end" wrap="nowrap">
              <DefaultButton oc="blue" size={'xs'} onClick={() => viewFunc(series)}>
                View
              </DefaultButton>
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
          <th>
            <DefaultText fw={'bold'} size="sm">
              Title
            </DefaultText>
          </th>
          <th>
            <DefaultText fw={'bold'} size="sm">
              Status
            </DefaultText>
          </th>
          <th>
            <DefaultText fw={'bold'} size="sm">
              Author
            </DefaultText>
          </th>
          <th> </th>
        </tr>
      </thead>
      <tbody>{renderRows()}</tbody>
    </Table>
  );
};

export default LibraryList;
