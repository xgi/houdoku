import React from 'react';
import { Button, Col, Dropdown, Menu, Modal, Row } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import { LayoutDirection, PageFit, PageView } from '../models/types';
import styles from './ReaderSettingsModal.css';
import { RootState } from '../store';
import {
  setLayoutDirection,
  setPageFit,
  setPageView,
  setPreloadAmount,
} from '../features/settings/actions';
import { toggleShowingSettingsModal } from '../features/reader/actions';

/**
 * Text maps for different settings values. These have keys from each possible value for the
 * settings, and user-friendly strings representing the setting value. They are displayed to the
 * user when selecting the options from drop-down menus.
 */
const layoutDirectionText: { [key in LayoutDirection]: string } = {
  [LayoutDirection.LeftToRight]: 'Left-to-Right',
  [LayoutDirection.RightToLeft]: 'Right-to-Left',
};
const pageViewText: { [key in PageView]: string } = {
  [PageView.Single]: 'Single',
  [PageView.Double]: 'Double (Even Start)',
  [PageView.Double_OddStart]: 'Double (Odd Start)',
};
const pageFitText: { [key in PageFit]: string } = {
  [PageFit.Auto]: 'Auto',
  [PageFit.Width]: 'Fit Width',
  [PageFit.Height]: 'Fit Height',
};
const preloadText: { [key: number]: string } = {
  0: 'Disabled',
  1: '1 Page',
  2: '2 Pages',
  3: '3 Pages',
  4: '4 Pages',
  5: '5 Pages',
};

const mapState = (state: RootState) => ({
  showingSettingsModal: state.reader.showingSettingsModal,
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  setPageView: (pageView: PageView) => dispatch(setPageView(pageView)),
  setLayoutDirection: (layoutDirection: LayoutDirection) =>
    dispatch(setLayoutDirection(layoutDirection)),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  toggleShowingSettingsModal: () => dispatch(toggleShowingSettingsModal()),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderSettingsModal: React.FC<Props> = (props: Props) => {
  /**
   * Generate menu item JSX elements for a setting.
   * @param textMap the text map for the desired setting. See examples above.
   * @returns an element containing <Menu.Item>'s for each option in the textMap.
   */
  const renderMenuItems = (textMap: { [key: number]: string }) => {
    return (
      <>
        {Object.entries(textMap).map((entry) => {
          return (
            <Menu.Item key={entry[0]} data-value={entry[0]}>
              {entry[1]}
            </Menu.Item>
          );
        })}
      </>
    );
  };

  const layoutDirectionMenu = (
    <Menu
      onClick={(e) =>
        props.setLayoutDirection(parseInt(e.item.props['data-value'], 10))
      }
    >
      {renderMenuItems(layoutDirectionText)}
    </Menu>
  );
  const pageViewMenu = (
    <Menu
      onClick={(e) => {
        props.setPageView(parseInt(e.item.props['data-value'], 10));
      }}
    >
      {renderMenuItems(pageViewText)}
    </Menu>
  );
  const pageFitMenu = (
    <Menu
      onClick={(e) =>
        props.setPageFit(parseInt(e.item.props['data-value'], 10))
      }
    >
      {renderMenuItems(pageFitText)}
    </Menu>
  );
  const preloadMenu = (
    <Menu
      onClick={(e) =>
        props.setPreloadAmount(parseInt(e.item.props['data-value'], 10))
      }
    >
      {renderMenuItems(preloadText)}
    </Menu>
  );

  return (
    <Modal
      title="Reader Settings"
      visible={props.showingSettingsModal}
      footer={null}
      onCancel={props.toggleShowingSettingsModal}
    >
      <Row className={styles.settingRow}>
        <Col span={16}>Layout Direction</Col>
        <Col span={8}>
          <Dropdown overlay={layoutDirectionMenu}>
            <Button>
              {layoutDirectionText[props.layoutDirection]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.settingRow}>
        <Col span={16}>Page View</Col>
        <Col span={8}>
          <Dropdown overlay={pageViewMenu}>
            <Button>
              {pageViewText[props.pageView]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.settingRow}>
        <Col span={16}>Page Fit</Col>
        <Col span={8}>
          <Dropdown overlay={pageFitMenu}>
            <Button>
              {pageFitText[props.pageFit]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.settingRow}>
        <Col span={16}>Image Preloading</Col>
        <Col span={8}>
          <Dropdown overlay={preloadMenu}>
            <Button>
              {preloadText[props.preloadAmount]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </Modal>
  );
};

export default connector(ReaderSettingsModal);
