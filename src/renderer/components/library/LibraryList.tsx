import React from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { goToSeries } from '@/renderer/features/library/utils';
import { Table, TableBody, TableCell, TableRow } from '@/ui/components/Table';
import { Badge } from '@/ui/components/Badge';
import { ContextMenu, ContextMenuTrigger } from '@/ui/components/ContextMenu';
import LibraryGridContextMenu from './LibraryGridContextMenu';

type Props = {
  getFilteredList: () => Series[];
  showRemoveModal: (series: Series) => void;
};

const LibraryList: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();

  const getCreatorsText = (series: Series) => {
    const creators = Array.from(new Set([...series.authors, ...series.artists]));
    return creators.length > 0 ? creators.join('; ') : 'Unknown';
  };

  const viewFunc = (series: Series) => {
    goToSeries(series, navigate);
  };

  return (
    <Table>
      <TableBody>
        {props.getFilteredList().map((series) => (
          <>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <TableRow
                  key={`${series.id}-${series.title}`}
                  className="cursor-pointer"
                  onClick={() => viewFunc(series)}
                >
                  <TableCell className="truncate flex space-x-2">
                    {series.numberUnread > 0 && <Badge>{series.numberUnread}</Badge>}
                    <span>{series.title}</span>
                  </TableCell>
                  <TableCell className="truncate max-w-40">
                    <span>{getCreatorsText(series)}</span>
                  </TableCell>
                  <TableCell>
                    <span>{series.status}</span>
                  </TableCell>
                </TableRow>
              </ContextMenuTrigger>
              <LibraryGridContextMenu series={series} showRemoveModal={props.showRemoveModal} />
            </ContextMenu>
          </>
        ))}
      </TableBody>
    </Table>
  );
};

export default LibraryList;
