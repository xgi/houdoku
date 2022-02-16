/* eslint-disable react/jsx-boolean-value */
import React, { useState } from 'react';
import {
  Button,
  Slider,
  Input,
  Dropdown,
  Menu,
  Popover,
  Select,
  Badge,
} from 'antd';
import { DownOutlined, SyncOutlined } from '@ant-design/icons';
import { Header } from 'antd/lib/layout/layout';
import { connect, ConnectedProps } from 'react-redux';
import { Series, SeriesStatus } from 'houdoku-extension-lib';
import styles from './LibraryControlBar.css';
import { setFilter } from '../../features/library/actions';
import { loadSeriesList, reloadSeriesList } from '../../features/library/utils';
import { setStatusText } from '../../features/statusbar/actions';
import { RootState } from '../../store';
import { ProgressFilter } from '../../models/types';
import {
  setLibraryColumns,
  setLibraryFilterProgress,
  setLibraryFilterStatus,
  setLibraryFilterUserTags,
} from '../../features/settings/actions';

const { Option } = Select;

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  reloadingSeriesList: state.library.reloadingSeriesList,
  userTags: state.library.userTags,
  filter: state.library.filter,
  libraryFilterStatus: state.settings.libraryFilterStatus,
  libraryFilterProgress: state.settings.libraryFilterProgress,
  libraryFilterUserTags: state.settings.libraryFilterUserTags,
  libraryColumns: state.settings.libraryColumns,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeriesList: () => loadSeriesList(dispatch),
  reloadSeriesList: (seriesList: Series[], callback?: () => void) =>
    reloadSeriesList(dispatch, seriesList, callback),
  setFilter: (filter: string) => dispatch(setFilter(filter)),
  setLibraryFilterStatus: (status: SeriesStatus | null) =>
    dispatch(setLibraryFilterStatus(status)),
  setLibraryFilterProgress: (progressFilter: ProgressFilter) =>
    dispatch(setLibraryFilterProgress(progressFilter)),
  setFilterUserTags: (userTags: string[]) =>
    dispatch(setLibraryFilterUserTags(userTags)),
  setLibraryColumns: (libraryColumns: number) =>
    dispatch(setLibraryColumns(libraryColumns)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const LibraryControlBar: React.FC<Props> = (props: Props) => {
  const [showingColumnsPopover, setShowingColumnsPopover] = useState(false);
  const [showingTagsPopover, setShowingTagsPopover] = useState(false);

  /**
   * Get a displayable string for the current filterStatus value.
   * @returns a user-friendly representation of the filterStatus prop
   */
  const getFilterStatusText = () => {
    const status = props.libraryFilterStatus;

    let valueText = '';
    if (status === null) valueText = 'Any';
    else valueText = status;
    return `Status: ${valueText}`;
  };

  /**
   * Get a displayable string for the current filterProgress value.
   * @returns a user-friendly representation of the filterProgress prop
   */
  const getFilterProgressText = () => {
    const prefix = 'Progress: ';

    if (props.libraryFilterProgress === ProgressFilter.All)
      return `${prefix}All`;
    if (props.libraryFilterProgress === ProgressFilter.Unread)
      return `${prefix}Unread`;
    if (props.libraryFilterProgress === ProgressFilter.Finished)
      return `${prefix}Finished`;
    return prefix;
  };

  return (
    <>
      <Header className={styles.header}>
        <Button
          className={styles.reloadButton}
          type="primary"
          onClick={() => {
            if (!props.reloadingSeriesList) {
              props.reloadSeriesList(props.seriesList, props.loadSeriesList);
            }
          }}
        >
          {props.reloadingSeriesList ? <SyncOutlined spin /> : 'Refresh'}
        </Button>
        <Popover
          content={
            <Slider
              min={2}
              max={8}
              step={2}
              value={props.libraryColumns}
              onChange={(value: number) => props.setLibraryColumns(value)}
            />
          }
          title="Change number of columns"
          trigger="click"
          visible={showingColumnsPopover}
          onVisibleChange={(visible: boolean) =>
            setShowingColumnsPopover(visible)
          }
        >
          <Button className={styles.columnsButton}>Columns</Button>
        </Popover>
        <Popover
          content={
            <Select
              mode="tags"
              allowClear
              style={{ width: '100%' }}
              placeholder="Enter tags..."
              value={props.libraryFilterUserTags}
              onChange={(userTags: string[]) =>
                props.setFilterUserTags(userTags)
              }
            >
              {props.userTags.map((userTag: string) => (
                <Option key={userTag} value={userTag}>
                  {userTag}
                </Option>
              ))}
            </Select>
          }
          title="Filter by user tag"
          trigger="click"
          visible={showingTagsPopover}
          onVisibleChange={(visible: boolean) => setShowingTagsPopover(visible)}
        >
          <Button className={styles.tagsButton}>
            <Badge
              className={styles.userTagsBadge}
              count={props.libraryFilterUserTags.length}
            />
            Filter Tags
          </Button>
        </Popover>
        <Dropdown
          className={styles.progressDropdown}
          overlay={
            <Menu
              onClick={(e: any) =>
                props.setLibraryFilterProgress(e.item.props['data-value'])
              }
            >
              <Menu.Item
                key={ProgressFilter.All}
                data-value={ProgressFilter.All}
              >
                All
              </Menu.Item>
              <Menu.Item
                key={ProgressFilter.Unread}
                data-value={ProgressFilter.Unread}
              >
                Unread
              </Menu.Item>
              <Menu.Item
                key={ProgressFilter.Finished}
                data-value={ProgressFilter.Finished}
              >
                Finished
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            {getFilterProgressText()} <DownOutlined />
          </Button>
        </Dropdown>
        <Dropdown
          className={styles.statusDropdown}
          overlay={
            <Menu
              onClick={(e: any) =>
                props.setLibraryFilterStatus(e.item.props['data-value'])
              }
            >
              <Menu.Item key={null} data-value={null}>
                Any
              </Menu.Item>
              <Menu.Item
                key={SeriesStatus.ONGOING}
                data-value={SeriesStatus.ONGOING}
              >
                Ongoing
              </Menu.Item>
              <Menu.Item
                key={SeriesStatus.COMPLETED}
                data-value={SeriesStatus.COMPLETED}
              >
                Completed
              </Menu.Item>
              <Menu.Item
                key={SeriesStatus.CANCELLED}
                data-value={SeriesStatus.CANCELLED}
              >
                Cancelled
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            {getFilterStatusText()} <DownOutlined />
          </Button>
        </Dropdown>
        <Input
          className={styles.seriesFilter}
          placeholder="Filter series list..."
          onChange={(e) => props.setFilter(e.target.value)}
        />
      </Header>
    </>
  );
};

export default connector(LibraryControlBar);
