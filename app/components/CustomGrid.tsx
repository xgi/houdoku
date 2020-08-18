import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import blankCover from '../img/blank_cover.png';

type CustomGridProps = {
  columns: number;
};

const CustomGrid: React.FC<CustomGridProps> = (props: CustomGridProps) => {
  const { columns } = props;

  const items: number[] = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div>
      <GridList cols={columns}>
        {items.map((item: number) => {
          return (
            <GridListTile key={item} style={{}}>
              <img src={blankCover} alt={item.toString()} />
            </GridListTile>
          );
        })}
      </GridList>
    </div>
  );
};

export default CustomGrid;
