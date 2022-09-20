import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import log from 'electron-log';
import { Loader } from '@mantine/core';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';

type Props = {
  series: Series;
  url?: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  width?: string | number;
  height?: string | number;
  loadingDisplay?: 'cover' | 'spinner';
  'data-num'?: number;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
};

const ExtensionImage: React.FC<Props> = (props: Props) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>();

  useEffect(() => {
    if (props.url) {
      if (props.url.startsWith('http')) {
        ipcRenderer
          .invoke(
            ipcChannels.EXTENSION.GET_IMAGE,
            props.series.extensionId,
            props.series,
            props.url
          )
          .then((data) => {
            if (typeof data === 'string') {
              setResolvedUrl(data);
            } else {
              setResolvedUrl(URL.createObjectURL(new Blob([data])));
            }
          })
          .catch((e) => log.error(e));
      } else {
        setResolvedUrl(props.url);
      }
    }
  }, [props.url, props.series]);

  if (!resolvedUrl && props.loadingDisplay === 'spinner')
    return (
      <div
        className={props.className}
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        <Loader />
      </div>
    );

  return (
    <img
      className={props.className}
      style={props.style}
      src={resolvedUrl || blankCover}
      alt={props.alt}
      width={props.width}
      height={props.height}
      data-num={props['data-num']}
      onLoad={props.onLoad}
    />
  );
};

export default ExtensionImage;
