import React from 'react';
import { Col, Row, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { connect, ConnectedProps } from 'react-redux';
import styles from './ReaderSettings.css';
import {
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../../models/types';
import { RootState } from '../../store';
import {
  setLayoutDirection,
  setOverlayPageNumber,
  setPageFit,
  setPageView,
  setPreloadAmount,
} from '../../features/settings/actions';

const layoutDirectionText: { [key in LayoutDirection]: string } = {
  [LayoutDirection.LeftToRight]: 'Left-to-Right',
  [LayoutDirection.RightToLeft]: 'Right-to-Left',
  [LayoutDirection.Vertical]: 'Vertical',
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
  pageFit: state.settings.pageFit,
  pageView: state.settings.pageView,
  layoutDirection: state.settings.layoutDirection,
  preloadAmount: state.settings.preloadAmount,
  overlayPageNumber: state.settings.overlayPageNumber,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  setPageFit: (pageFit: PageFit) => dispatch(setPageFit(pageFit)),
  setPageView: (pageView: PageView) => dispatch(setPageView(pageView)),
  setLayoutDirection: (layoutDirection: LayoutDirection) =>
    dispatch(setLayoutDirection(layoutDirection)),
  setPreloadAmount: (preloadAmount: number) =>
    dispatch(setPreloadAmount(preloadAmount)),
  setOverlayPageNumber: (overlayPageNumber: boolean) =>
    dispatch(setOverlayPageNumber(overlayPageNumber)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const ReaderSettings: React.FC<Props> = (props: Props) => {
  const updateReaderSetting = (readerSetting: ReaderSetting, value: any) => {
    switch (readerSetting) {
      case ReaderSetting.LayoutDirection:
        props.setLayoutDirection(value);
        break;
      case ReaderSetting.PageFit:
        props.setPageFit(value);
        break;
      case ReaderSetting.PageView:
        props.setPageView(value);
        break;
      case ReaderSetting.PreloadAmount:
        props.setPreloadAmount(value);
        break;
      case ReaderSetting.OverlayPageNumber:
        props.setOverlayPageNumber(value);
        break;
      default:
        break;
    }
  };

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

  const renderMenu = (
    readerSetting: ReaderSetting,
    textMap: { [key: number]: string }
  ) => {
    return (
      <Menu
        onClick={(e: any) => {
          updateReaderSetting(
            readerSetting,
            parseInt(e.item.props['data-value'], 10)
          );
        }}
      >
        {renderMenuItems(textMap)}
      </Menu>
    );
  };

  return (
    <>
      <Row className={styles.row}>
        <Col span={10}>Layout Direction</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(
              ReaderSetting.LayoutDirection,
              layoutDirectionText
            )}
          >
            <Button>
              {layoutDirectionText[props.layoutDirection]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Page View</Col>
        <Col span={14}>
          <Dropdown overlay={renderMenu(ReaderSetting.PageView, pageViewText)}>
            <Button>
              {pageViewText[props.pageView]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Page Fit</Col>
        <Col span={14}>
          <Dropdown overlay={renderMenu(ReaderSetting.PageFit, pageFitText)}>
            <Button>
              {pageFitText[props.pageFit]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Image Preloading</Col>
        <Col span={14}>
          <Dropdown
            overlay={renderMenu(ReaderSetting.PreloadAmount, preloadText)}
          >
            <Button>
              {preloadText[props.preloadAmount]} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Overlay Page Number</Col>
        <Col span={14}>
          <Dropdown
            overlay={
              <Menu
                onClick={(e: any) => {
                  updateReaderSetting(
                    ReaderSetting.OverlayPageNumber,
                    e.item.props['data-value'] === 'true'
                  );
                }}
              >
                <Menu.Item key={1} data-value="true">
                  Yes
                </Menu.Item>
                <Menu.Item key={2} data-value="false">
                  No
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.overlayPageNumber ? 'Yes' : 'No'}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </>
  );
};

export default connector(ReaderSettings);
