const fs = require('fs');
import React from 'react';
const { ipcRenderer } = require('electron');
import { Box, Grid, Group, Text, Badge } from '@mantine/core';
import { Languages, Series } from '@tiyo/common';
import ipcChannels from '@/common/constants/ipcChannels.json';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series;
};

const SeriesDetailsInfoGrid: React.FC<Props> = (props: Props) => {
  const language = Languages[props.series.originalLanguageKey];
  const languageStr = language !== undefined && 'name' in language ? language.name : '';

  const getCol = (heading: string, content: string) => (
    <Grid.Col span={3}>
      <Text ml={4} c="dimmed" size="sm" fw={700}>
        {heading}
      </Text>
      <Box bg={'dark.6'} py={6} px={12}>
        <Text size="sm" lineClamp={1} title={content}>
          {content}
        </Text>
      </Box>
    </Grid.Col>
  );

  return (
    <Grid my="xs" gutter="xs">
      {getCol('Author', props.series.authors.join('; ') || 'Unknown')}
      {getCol('Artist', props.series.artists.join('; ') || 'Unknown')}
      {getCol('Status', props.series.status || 'Unknown')}
      {getCol('Language', languageStr)}
      <Grid.Col span={12}>
        <Group gap="xs">
          {props.series.tags.map((tag: string) => (
            <Badge key={tag} color="indigo">
              {tag}
            </Badge>
          ))}
        </Group>
      </Grid.Col>
    </Grid>
  );
};

export default SeriesDetailsInfoGrid;
