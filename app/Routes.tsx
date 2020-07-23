/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './components/App';
import LibraryPage from './components/LibraryPage';
import SeriesPage from './components/SeriesPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.SERIES} component={SeriesPage} />
        <Route path={routes.LIBRARY} component={LibraryPage} />
      </Switch>
    </App>
  );
}
