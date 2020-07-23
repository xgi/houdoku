import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from '../styles/LibraryPage.css';

export default class SeriesPage extends React.Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: Record<string, any>) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Series</h2>
        <Link to={routes.LIBRARY}>to Library</Link>
      </div>
    );
  }
}
