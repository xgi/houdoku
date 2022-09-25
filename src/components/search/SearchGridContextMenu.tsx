import React, { useEffect } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import { IconEye, IconBookUpload } from '@tabler/icons';
import { importQueueState } from '../../state/libraryStates';

const WIDTH = 200;
const ESTIMATED_HEIGHT = 85;

type Props = {
  visible: boolean;
  position: { x: number; y: number };
  series: Series | null;
  close: () => void;
  openAddModal: (series: Series) => void;
};

const SearchGridContextMenu: React.FC<Props> = (props: Props) => {
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);

  let { x, y } = props.position;
  if (props.position.x + WIDTH > window.innerWidth) {
    x = props.position.x - WIDTH;
  }
  if (props.position.y + ESTIMATED_HEIGHT > window.innerHeight) {
    y = props.position.y - ESTIMATED_HEIGHT;
  }

  const viewDetailsFunc = () => {
    if (props.series) {
      props.openAddModal(props.series);
      props.close();
    }
  };

  const importFunc = () => {
    if (props.series) {
      setImportQueue([...importQueue, { series: props.series, getFirst: true }]);
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
          <Menu.Item icon={<IconEye size={14} />} onClick={viewDetailsFunc}>
            View details
          </Menu.Item>
          <Menu.Item icon={<IconBookUpload size={14} />} onClick={importFunc}>
            Add to library
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Portal>
  );
};

export default SearchGridContextMenu;
