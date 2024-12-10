const fs = require('fs');
import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilValue } from 'recoil';
import path from 'path';
import { Series } from '@tiyo/common';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { currentExtensionMetadataState } from '@/renderer/state/libraryStates';
import constants from '@/common/constants/constants.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { ScrollArea } from '@/ui/components/ScrollArea';
import { Badge } from '@/ui/components/Badge';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series;
};

const SeriesDetailsIntro: React.FC<Props> = (props: Props) => {
  const currentExtensionMetadata = useRecoilValue(currentExtensionMetadataState);

  const getThumbnailPath = () => {
    const fileExtensions = constants.IMAGE_EXTENSIONS;
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(thumbnailsDir, `${props.series.id}.${fileExtensions[i]}`);
      if (fs.existsSync(thumbnailPath)) return `atom://${encodeURIComponent(thumbnailPath)}`;
    }

    if (props.series.extensionId === FS_METADATA.id) {
      return props.series.remoteCoverUrl
        ? `atom://${encodeURIComponent(props.series.remoteCoverUrl)}`
        : blankCover;
    }
    return props.series.remoteCoverUrl || blankCover;
  };

  return (
    <div className="flex">
      <div className="max-w-[140px] md:max-w-[180px]">
        <img
          src={getThumbnailPath()}
          alt={props.series.title}
          className="w-auto h-auto -mt-[70%] aspect-[70/100] object-cover rounded-sm"
        />
      </div>
      <div className="w-full py-2 px-2">
        <div className="flex justify-between">
          <h2 className="text-lg font-bold line-clamp-1">{props.series.title}</h2>
          <Badge variant={'secondary'} className="cursor-default text-xs">
            {currentExtensionMetadata?.name}
          </Badge>
        </div>
        <ScrollArea className="h-[60px] md:h-[90px]">{props.series.description}</ScrollArea>
      </div>
    </div>
  );
};

export default SeriesDetailsIntro;
