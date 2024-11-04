const fs = require('fs');
import React from 'react';
const { ipcRenderer } = require('electron');
import { useRecoilValue } from 'recoil';
import { Grid, Group, Image, ScrollArea } from '@mantine/core';
import path from 'path';
import { Series } from '@tiyo/common';
import blankCover from '@/renderer/img/blank_cover.png';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { currentExtensionMetadataState } from '@/renderer/state/libraryStates';
import constants from '@/common/constants/constants.json';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import DefaultText from '../../general/DefaultText';
import DefaultTitle from '../../general/DefaultTitle';

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
      if (fs.existsSync(thumbnailPath)) return `atom://${thumbnailPath}`;
    }

    if (props.series.extensionId === FS_METADATA.id) {
      return props.series.remoteCoverUrl ? `atom://${props.series.remoteCoverUrl}` : blankCover;
    }
    return props.series.remoteCoverUrl || blankCover;
  };

  return (
    <Grid columns={24} gutter="xs">
      <Grid.Col span={5}>
        <Image src={getThumbnailPath()} alt={props.series.title} width="100%" mt="-50%" />
      </Grid.Col>
      <Grid.Col span={19}>
        <Group justify="space-between" mt="xs" mb="xs" align="center" wrap="nowrap">
          <DefaultTitle order={4} lineClamp={1}>
            {props.series.title}
          </DefaultTitle>
          <DefaultText>{currentExtensionMetadata?.name}</DefaultText>
        </Group>
        <ScrollArea h={100} style={{ whiteSpace: 'pre-wrap' }}>
          <DefaultText>{props.series.description}</DefaultText>
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};

export default SeriesDetailsIntro;
