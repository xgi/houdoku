import React, { useEffect, useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import { IconEye, IconBookUpload } from '@tabler/icons';
import { importQueueState } from '../../state/libraryStates';

const ELEMENT_ID = 'SearchGridContextMenu';
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
  const [sanitizedPos, setSanitizedPos] = useState<{ x: number; y: number }>(props.position);

  useEffect(() => {
    const newPos = { ...props.position };
    if (props.position.x + WIDTH > window.innerWidth) {
      newPos.x = props.position.x - WIDTH;
    }
    if (props.position.y + ESTIMATED_HEIGHT > window.innerHeight) {
      newPos.y = props.position.y - ESTIMATED_HEIGHT;
    }
    setSanitizedPos(newPos);
  }, [props.position]);

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
        e.clientX < sanitizedPos.x ||
        e.clientX > sanitizedPos.x + WIDTH ||
        e.clientY < sanitizedPos.y ||
        e.clientY > sanitizedPos.y + ESTIMATED_HEIGHT
      ) {
        props.close();
      }
    };

    document.addEventListener('mousedown', mousedownListener);
    return () => {
      document.removeEventListener('mousedown', mousedownListener);
    };
  });

  useEffect(() => {
    const element = document.getElementById(ELEMENT_ID);
    if (element) {
      element.style.setProperty('left', `${sanitizedPos.x}px`);
      element.style.setProperty('top', `${sanitizedPos.y}px`);
      element.style.removeProperty('display');
    }
  }, [sanitizedPos]);

  if (!props.visible) return <></>;
  return (
    <Portal>
      <Menu shadow="md" width={WIDTH} opened>
        <Menu.Dropdown id={ELEMENT_ID} style={{ display: 'none' }}>
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
