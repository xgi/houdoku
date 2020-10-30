import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { hot } from 'react-hot-loader/root';
import { History } from 'history';
import { Store } from '../store';
import Routes from '../Routes';

type Props = {
  store: Store;
  history: History;
};

const Root = ({ store, history }: Props) => {
  history.listen((location, action) => {
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 1000);
  });

  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  );
};

export default hot(Root);
