import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import blankCover from '../img/blank_cover.png';
import Series from '../models/series';

type Props = {
  columns: number;
  seriesList: Series[];
};

const LibraryGrid: React.FC<Props> = (props: Props) => {
  const { columns, seriesList } = props;

  return (
    <div>
      <GridList cols={columns} cellHeight={300}>
        {seriesList.map((series: Series) => {
          return (
            <GridListTile key={series.uuid}>
              <img
                src={blankCover}
                alt={series.toString()}
                title={series.name}
              />
              <GridListTileBar title={series.name} subtitle={series.author} />
            </GridListTile>
          );
        })}
      </GridList>
    </div>
  );
};

export default LibraryGrid;
