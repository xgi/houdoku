import React from 'react';
import { Link } from 'react-router-dom';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import routes from '../constants/routes.json';
import styles from '../styles/LibraryPage.css';
import blankCover from '../img/blank_cover.png';

export default class LibraryPage extends React.Component {
  constructor(props: Record<string, any>) {
    super(props);
    this.state = {};
  }

  renderCovers = () => {
    const items: number[] = [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
    ];
    return (
      <GridList cols={5}>
        {items.map((item: number) => {
          return (
            <GridListTile key={item} style={{}}>
              <img src={blankCover} alt={item.toString()} />
            </GridListTile>
          );
        })}
      </GridList>
    );
  };

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Library</h2>
        {this.renderCovers()}
        <Link to={routes.SERIES}>to Series</Link>
      </div>
    );
  }
}
