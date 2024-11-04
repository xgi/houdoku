import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import { IconPlayerPlay, IconChecks, IconTrash, IconHandClick } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';
import {
  chapterListState,
  multiSelectEnabledState,
  multiSelectSeriesListState,
  seriesListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import { goToSeries, markChapters, removeSeries } from '@/renderer/features/library/utils';
import {
  chapterLanguagesState,
  confirmRemoveSeriesState,
  themeState,
} from '@/renderer/state/settingStates';
import library from '@/renderer/services/library';
import DefaultMenu from '../general/DefaultMenu';
import { themeProps } from '@/renderer/util/themes';

const ELEMENT_ID = 'LibraryGridContextMenu';
const WIDTH = 200;
const ESTIMATED_HEIGHT = 150;

type Props = {
  visible: boolean;
  position: { x: number; y: number };
  series: Series | null;
  close: () => void;
  showRemoveModal: (series: Series) => void;
};

const LibraryGridContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const theme = useRecoilValue(themeState);
  const confirmRemoveSeries = useRecoilValue(confirmRemoveSeriesState);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setSeries = useSetRecoilState(seriesState);
  const setChapterList = useSetRecoilState(chapterListState);
  const setMultiSelectEnabled = useSetRecoilState(multiSelectEnabledState);
  const setMultiSelectSeriesList = useSetRecoilState(multiSelectSeriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
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

  const viewFunc = () => {
    if (props.series) {
      goToSeries(props.series, setSeriesList, navigate);
    }
    props.close();
  };

  const markAllReadFunc = () => {
    if (props.series?.id) {
      const chapters = library.fetchChapters(props.series.id);
      markChapters(chapters, props.series, true, setChapterList, setSeries, chapterLanguages);
      setSeriesList(library.fetchSeriesList());
    }
    props.close();
  };

  const multiSelectFunc = () => {
    if (props.series) {
      setMultiSelectEnabled(true);
      setMultiSelectSeriesList([props.series]);
    }
    props.close();
  };

  const removeFunc = () => {
    if (props.series) {
      if (confirmRemoveSeries) {
        props.showRemoveModal(props.series);
      } else {
        removeSeries(props.series, setSeriesList);
      }
    }
    props.close();
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
      <DefaultMenu shadow="md" width={WIDTH} opened>
        <Menu.Dropdown id={ELEMENT_ID} style={{ display: 'none' }} {...themeProps(theme)}>
          <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={viewFunc}>
            View series
          </Menu.Item>
          <Menu.Item leftSection={<IconChecks size={14} />} onClick={markAllReadFunc}>
            Mark all read
          </Menu.Item>
          <Menu.Item leftSection={<IconHandClick size={14} />} onClick={multiSelectFunc}>
            Multi-select
          </Menu.Item>
          <Menu.Item leftSection={<IconTrash size={14} />} onClick={removeFunc}>
            Remove series
          </Menu.Item>
        </Menu.Dropdown>
      </DefaultMenu>
    </Portal>
  );
};

export default LibraryGridContextMenu;
