import React, { useEffect, useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Menu, Portal, ScrollArea } from '@mantine/core';
import { IconTrash, IconEye, IconSquareCheck, IconSquare } from '@tabler/icons';
import { ipcRenderer } from 'electron';
import { goToSeries, removeSeries } from '../../features/library/utils';
import { categoryListState, seriesListState } from '../../state/libraryStates';
import library from '../../services/library';
import ipcChannels from '../../constants/ipcChannels.json';
import { confirmRemoveSeriesState, customDownloadsDirState } from '../../state/settingStates';

const ELEMENT_ID = 'LibraryGridContextMenu';
const WIDTH = 200;
const MAX_HEIGHT = 220;

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

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
  const [menuHeight, setMenuHeight] = useState(MAX_HEIGHT);
  const availableCategories = useRecoilValue(categoryListState);
  const [categories, setCategories] = useState<string[]>([]);
  const [sanitizedPos, setSanitizedPos] = useState<{ x: number; y: number }>(props.position);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);

  const viewFunc = () => {
    if (props.series) {
      goToSeries(props.series, setSeriesList, navigate);
      props.close();
    }
  };

  const removeFunc = () => {
    if (props.series) {
      if (confirmRemoveSeries) {
        props.showRemoveModal(props.series);
      } else {
        removeSeries(props.series, setSeriesList, false, customDownloadsDir || defaultDownloadsDir);
      }
      props.close();
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    if (props.series) {
      let newCategories: string[] = [...categories, categoryId];
      if (categories.includes(categoryId)) {
        newCategories = categories.filter((cat) => cat !== categoryId);
      }
      setCategories(newCategories);
    }
  };

  useEffect(() => {
    const newPos = { ...props.position };
    if (props.position.x + WIDTH > window.innerWidth) {
      newPos.x = props.position.x - WIDTH;
    }
    if (props.position.y + menuHeight > window.innerHeight) {
      newPos.y = props.position.y - menuHeight;
    }
    setSanitizedPos(newPos);
  }, [props.position, menuHeight]);

  useEffect(() => {
    if (props.series) {
      library.upsertSeries({
        ...props.series,
        categories,
      });
      setSeriesList(library.fetchSeriesList());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  useEffect(() => {
    const totalItemHeight = (2 + availableCategories.length) * 40;
    setMenuHeight(Math.min(MAX_HEIGHT, totalItemHeight));

    setCategories(props.series?.categories || []);
  }, [availableCategories.length, props.series]);

  useEffect(() => {
    const mousedownListener = (e: MouseEvent) => {
      if (
        e.clientX < sanitizedPos.x ||
        e.clientX > sanitizedPos.x + WIDTH ||
        e.clientY < sanitizedPos.y ||
        e.clientY > sanitizedPos.y + menuHeight
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
          <ScrollArea.Autosize maxHeight={MAX_HEIGHT - 10}>
            <Menu.Item icon={<IconEye size={14} />} onClick={viewFunc}>
              View
            </Menu.Item>
            <Menu.Item icon={<IconTrash size={14} />} onClick={removeFunc}>
              Remove
            </Menu.Item>

            {availableCategories.length > 0 ? (
              <Menu.Divider style={{ width: WIDTH - 10 }} />
            ) : undefined}

            {availableCategories.map((category) => {
              const hasCategory = categories.includes(category.id);
              return (
                <Menu.Item
                  key={category.id}
                  icon={hasCategory ? <IconSquareCheck size={14} /> : <IconSquare size={14} />}
                  onClick={() => handleToggleCategory(category.id)}
                >
                  {category.label}
                </Menu.Item>
              );
            })}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>
    </Portal>
  );
};

export default LibraryGridContextMenu;
