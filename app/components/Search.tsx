import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Descriptions, Affix, Input } from 'antd';
import styles from './Search.css';
import routes from '../constants/routes.json';

type Props = {
  library: Library;
};

const Search: React.FC<Props> = (props: Props) => {
  return (
    <div>
      <Link to={routes.LIBRARY}>
        <Button>◀ Back to library</Button>
      </Link>
      <p>search for a series:</p>
      <Input />
    </div>
  );
};

export default Search;
