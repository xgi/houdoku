import React from 'react';
import { Select, Col, Row, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import { connect, ConnectedProps } from 'react-redux';
import styles from './Settings.css';
import { RootState } from '../store';

const { Option } = Select;

const mapState = (state: RootState) => ({
  chapterLanguages: state.settings.chapterLanguages,
  refreshOnStart: state.settings.refreshOnStart,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const Extensions: React.FC<Props> = (props: Props) => {
  return (
    <>
      {/* <Title className={styles.title} level={4}>
        General
      </Title> */}
      <Row className={styles.row}>
        <Col span={10}>Languages in Chapter List</Col>
        <Col span={14}>
          <Paragraph>Something</Paragraph>
        </Col>
      </Row>
    </>
  );
};

export default connector(Extensions);
