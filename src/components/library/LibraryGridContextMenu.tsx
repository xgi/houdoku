/* eslint-disable react/button-has-type */
import React, { useEffect } from 'react';
import { CaretRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Series } from 'houdoku-extension-lib';
import { useHistory } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styles from './LibraryGridContextMenu.css';
import { goToSeries } from '../../features/library/utils';
import { seriesListState } from '../../state/libraryStates';
import SeriesExtensionNotFoundModalContent from './SeriesExtensionNotFoundModalContent';

const WIDTH = 150;
const HEIGHT = 180;

type Props = {
  visible: boolean;
  position: { x: number; y: number };
  series: Series | null;
  close: () => void;
  showRemoveModal: (() => void) | undefined;
};

const LibraryGridContextMenu: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const setSeriesList = useSetRecoilState(seriesListState);

  let { x, y } = props.position;
  if (props.position.x + WIDTH > window.innerWidth) {
    x = props.position.x - WIDTH;
  }
  if (props.position.y + HEIGHT > window.innerHeight) {
    y = props.position.y - HEIGHT;
  }

  const viewFunc = () => {
    if (props.series) {
      goToSeries(
        props.series,
        setSeriesList,
        <SeriesExtensionNotFoundModalContent series={props.series} />,
        history
      );
    }
  };

  useEffect(() => {
    const mousedownListener = (e: MouseEvent) => {
      if (e.clientX < x || e.clientX > x + WIDTH || e.clientY < y || e.clientY > y + HEIGHT) {
        props.close();
      }
    };

    document.addEventListener('mousedown', mousedownListener);
    return () => {
      document.removeEventListener('mousedown', mousedownListener);
    };
  });

  if (!props.visible) return <></>;
  return (
    <div
      className={styles.container}
      style={{
        width: WIDTH,
        left: x,
        top: y,
      }}
    >
      <button className={styles.button} onClick={viewFunc}>
        <CaretRightOutlined /> View
      </button>
      <button
        className={styles.button}
        onClick={() => {
          if (props.showRemoveModal) props.showRemoveModal();
          props.close();
        }}
      >
        <DeleteOutlined /> Remove
      </button>
    </div>
  );
};

export { WIDTH as ContextMenuWidth, HEIGHT as ContextMenuHeight };
export default LibraryGridContextMenu;
