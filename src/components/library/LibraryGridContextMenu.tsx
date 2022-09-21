import React, { useEffect } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import { IconTrash, IconEye } from '@tabler/icons';
import { goToSeries } from '../../features/library/utils';
import { seriesListState } from '../../state/libraryStates';

const WIDTH = 200;
const ESTIMATED_HEIGHT = 85;

type Props = {
  visible: boolean;
  position: { x: number; y: number };
  series: Series | null;
  close: () => void;
  showRemoveModal: (series: Series) => void;
};

const LibraryGridContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const setSeriesList = useSetRecoilState(seriesListState);

  let { x, y } = props.position;
  if (props.position.x + WIDTH > window.innerWidth) {
    x = props.position.x - WIDTH;
  }
  if (props.position.y + ESTIMATED_HEIGHT > window.innerHeight) {
    y = props.position.y - ESTIMATED_HEIGHT;
  }

  const viewFunc = () => {
    if (props.series) {
      goToSeries(props.series, setSeriesList, navigate);
      props.close();
    }
  };

  const removeFunc = () => {
    if (props.series) {
      props.showRemoveModal(props.series);
      props.close();
    }
  };

  useEffect(() => {
    const mousedownListener = (e: MouseEvent) => {
      if (
        e.clientX < x ||
        e.clientX > x + WIDTH ||
        e.clientY < y ||
        e.clientY > y + ESTIMATED_HEIGHT
      ) {
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
    <Portal>
      <Menu
        shadow="md"
        width={WIDTH}
        opened
        styles={() => ({
          dropdown: {
            left: x,
            top: y,
          },
        })}
      >
        <Menu.Dropdown style={{ position: 'absolute', left: x, top: y }}>
          <Menu.Item icon={<IconEye size={14} />} onClick={viewFunc}>
            View
          </Menu.Item>
          <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={removeFunc}>
            Remove from library
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Portal>
  );
};

export default LibraryGridContextMenu;
