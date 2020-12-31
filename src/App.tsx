import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { configuredStore } from './store';
import routes from './constants/routes.json';
import DashboardPage from './components/DashboardPage';
import ReaderPage from './components/ReaderPage';

const store = configuredStore();

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path={routes.LIBRARY} component={DashboardPage} />
          <Route path={routes.SERIES} component={DashboardPage} />
          <Route path={routes.READER} component={ReaderPage} />
        </Switch>
      </Router>
    </Provider>
  );
}
