const fs = require('fs');
import React from 'react';
const { ipcRenderer } = require('electron');
import { Box, Grid, Group, Badge } from '@mantine/core';
import { Languages, Series } from '@tiyo/common';
import ipcChannels from '@/common/constants/ipcChannels.json';
import DefaultText from '../../general/DefaultText';
import styles from './SeriesDetailsInfoGrid.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series;
};

const SeriesDetailsInfoGrid: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);
  const language = Languages[props.series.originalLanguageKey];
  const languageStr = language !== undefined && 'name' in language ? language.name : '';

  const getCol = (heading: string, content: string) => (
    <Grid.Col span={3}>
      <DefaultText ml={4} size="sm" fw={700}>
        {heading}
      </DefaultText>
      <Box {...themeProps(theme)} className={styles.item} py={6} px={12}>
        <DefaultText size="sm" lineClamp={1} title={content}>
          {content}
        </DefaultText>
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
