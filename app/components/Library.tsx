import React from 'react';
import Button from '@material-ui/core/Button';
// import { Link } from 'react-router-dom';
// import GridList from '@material-ui/core/GridList';
// import GridListTile from '@material-ui/core/GridListTile';
// import routes from '../constants/routes.json';
// import styles from './Library.css';
// import blankCover from '../img/blank_cover.png';

//   renderCovers = () => {
//     const items: number[] = [1, 2, 3, 4, 5, 6, 7];
//     return (
//       <GridList cols={5}>
//         {items.map((item: number) => {
//           return (
//             <GridListTile key={item} style={{}}>
//               <img src={blankCover} alt={item.toString()} />
//             </GridListTile>
//           );
//         })}
//       </GridList>
//     );
//   };

// export default function LibraryPage() {
//   const dispatch = useDispatch();
//   const value = useSelector(selectCount);

//   return (
//     <div className={styles.container} data-tid="container">
//       <h2>Library</h2>
//       <button onClick={() => dispatch(updateSeriesList())}> series list</button>
//       <p>current value: {value}</p>
//       <Link to={routes.SERIES}>to Series</Link>
//     </div>
//   );
// }
type LibraryProps = {
  seriesListUpdated: string;
  updateSeriesList: () => void;
};

const Library: React.FC<LibraryProps> = (props: LibraryProps) => {
  const { seriesListUpdated, updateSeriesList } = props;

  return (
    <div>
      <p>
        series list is:
        {seriesListUpdated}
      </p>
      <Button onClick={updateSeriesList}>update the series list</Button>
    </div>
  );
};

export default Library;
