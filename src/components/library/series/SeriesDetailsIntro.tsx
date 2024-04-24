import fs from 'fs';
import React from 'react';
import { ipcRenderer } from 'electron';
import { useRecoilValue } from 'recoil';
import { Grid, Group, Text, Image, Title, ScrollArea } from '@mantine/core';
import path from 'path';
import { Series } from '@tiyo/common';
import blankCover from '../../../img/blank_cover.png';
import ipcChannels from '../../../constants/ipcChannels.json';
import { currentExtensionMetadataState } from '../../../state/libraryStates';
import constants from '../../../constants/constants.json';

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
      if (fs.existsSync(thumbnailPath)) return thumbnailPath;
    }
    return props.series.remoteCoverUrl || blankCover;
  };

  return (
    <Grid columns={24} gutter="xs">
      <Grid.Col span={5}>
        <Image src={getThumbnailPath()} alt={props.series.title} width="100%" mt="-50%" />
      </Grid.Col>
      <Grid.Col span={19}>
        <Group position="apart" mt="xs" mb="xs" align="center" noWrap>
          <Title order={4} lineClamp={1}>
            {props.series.title}
          </Title>
          <Text>{currentExtensionMetadata?.name}</Text>
        </Group>
        <ScrollArea style={{ height: 100, whiteSpace: 'pre-wrap' }}>
          {props.series.description}
        </ScrollArea>
      </Grid.Col>
    </Grid>
  );
};

export default SeriesDetailsIntro;
