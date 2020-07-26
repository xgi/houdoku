import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';

export default class SeriesPage extends React.Component {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: Record<string, any>) {
    super(props);
    this.state = {};
  }

  render() {
    return <p>this is the series page</p>;
  }
}
