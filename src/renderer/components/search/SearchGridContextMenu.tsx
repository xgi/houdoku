import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Menu, Portal } from '@mantine/core';
import { IconEye, IconBookUpload, IconPlayerPlay } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { importingState, importQueueState, seriesListState } from '@/renderer/state/libraryStates';
import { goToSeries } from '@/renderer/features/library/utils';
import DefaultMenu from '../general/DefaultMenu';
import { themeProps } from '@/renderer/util/themes';
import { themeState } from '@/renderer/state/settingStates';

const ELEMENT_ID = 'SearchGridContextMenu';
const WIDTH = 200;
const ESTIMATED_HEIGHT = 110;

type Props = {
  visible: boolean;
  position: { x: number; y: number };
  series: Series | null;
  close: () => void;
  openAddModal: (series: Series) => void;
};

const SearchGridContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const theme = useRecoilValue(themeState);
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const [sanitizedPos, setSanitizedPos] = useState<{ x: number; y: number }>(props.position);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewSeries, setPreviewSeries] = useState<Series>();
  const importing = useRecoilValue(importingState);
  const setSeriesList = useSetRecoilState(seriesListState);

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

  const previewFunc = () => {
    if (props.series) {
      const tempPreviewSeries = { ...props.series, id: uuidv4(), preview: true };
      setPreviewSeries(tempPreviewSeries);
      setImportQueue([...importQueue, { series: tempPreviewSeries, getFirst: false }]);
      setLoadingPreview(true);
    }
  };

  useEffect(() => {
    if (loadingPreview && previewSeries && !importing) {
      setLoadingPreview(false);
      goToSeries(previewSeries, setSeriesList, navigate);
      props.close();
    }
  }, [importQueue, loadingPreview]);

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
          <Menu.Item leftSection={<IconEye size={14} />} onClick={viewDetailsFunc}>
            View details
          </Menu.Item>
          <Menu.Item leftSection={<IconBookUpload size={14} />} onClick={importFunc}>
            Add to library
          </Menu.Item>
          <Menu.Item leftSection={<IconPlayerPlay size={14} />} onClick={previewFunc}>
            Preview
          </Menu.Item>
        </Menu.Dropdown>
      </DefaultMenu>
    </Portal>
  );
};

export default SearchGridContextMenu;
