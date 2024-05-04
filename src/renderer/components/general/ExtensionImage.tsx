import { ipcRenderer } from 'electron';
import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import log from 'electron-log';
import { Button, Loader } from '@mantine/core';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../../common/constants/ipcChannels.json';

type Props = {
  series: Series;
  url?: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
  width?: string | number;
  height?: string | number;
  loadingDisplay?: 'cover' | 'spinner';
  allowRetry?: boolean;
  'data-num'?: number;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
};

const ExtensionImage: React.FC<Props> = (props: Props) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | undefined>();
  const [isError, setIsError] = useState(false);

  const loadImage = () => {
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
          .finally(() => setIsError(false))
          .catch((e) => {
            log.error(e);
            setIsError(true);
          });
      } else {
        setResolvedUrl(props.url);
      }
    }
  };

  useEffect(loadImage, [props.url, props.series]);

  if (!resolvedUrl && props.loadingDisplay === 'spinner') {
    return (
      <div
        className={props.className}
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        <Loader />
      </div>
    );
  }

  if (isError && props.allowRetry) {
    return (
      <div
        className={props.className}
        style={{ ...props.style, width: props.width, height: props.height }}
      >
        <Button onClick={loadImage}>Retry</Button>
      </div>
    );
  }

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
      onError={() => setIsError(true)}
    />
  );
};

export default ExtensionImage;
