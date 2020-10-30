/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import DashboardPage from './components/DashboardPage';

export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.LIBRARY} component={DashboardPage} />
        <Route path={routes.SERIES} component={DashboardPage} />
      </Switch>
    </App>
  );
}
