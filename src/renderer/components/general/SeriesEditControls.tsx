import React from 'react';
import { Language, Series, SeriesStatus, Languages, LanguageKey } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import {
  ActionIcon,
  Grid,
  Group,
  Select,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons';
import styles from './SeriesEditControls.module.css';
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import ExtensionImage from './ExtensionImage';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import blankCover from '@/renderer/img/blank_cover.png';

type Props = {
  series: Series;
  setSeries: (series: Series) => void;
  editable: boolean;
};

const SeriesEditControls: React.FC<Props> = (props: Props) => {
  const getCoverSrcUrl = () => {
    if (props.series.extensionId === FS_METADATA.id) {
      return props.series.remoteCoverUrl ? `atom://${props.series.remoteCoverUrl}` : blankCover;
    }
    return props.series.remoteCoverUrl;
  };

  return (
    <>
      <Grid gutter="xs">
        <Grid.Col span={4}>
          <ExtensionImage
            className={styles.coverImage}
            url={getCoverSrcUrl()}
            series={props.series}
            alt={props.series.title}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <Stack justify="end" style={{ height: '100%' }}>
            <Group wrap="nowrap">
              <TextInput
                value={props.series.remoteCoverUrl}
                title={props.series.remoteCoverUrl}
                placeholder="Cover URL..."
                disabled
              />
              <ActionIcon
                size="lg"
                variant="default"
                disabled={!props.editable}
                onClick={() =>
                  ipcRenderer
                    .invoke(
                      ipcChannels.APP.SHOW_OPEN_DIALOG,
                      false,
                      [
                        {
                          name: 'Image',
                          extensions: constants.IMAGE_EXTENSIONS,
                        },
                      ],
                      'Select Series Cover',
                    )
                    .then((fileList: string) => {
                      // eslint-disable-next-line promise/always-return
                      if (fileList.length > 0) {
                        props.setSeries({
                          ...props.series,
                          remoteCoverUrl: fileList[0],
                        });
                      }
                    })
                }
              >
                <IconUpload size={16} />
              </ActionIcon>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Title</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <TextInput
            value={props.series.title}
            title={props.series.title}
            placeholder="Title..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              props.setSeries({
                ...props.series,
                title: e.target.value,
              })
            }
            disabled={!props.editable}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Description</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Textarea
            disabled={!props.editable}
            value={props.series.description}
            title={props.series.description}
            placeholder="Description..."
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              props.setSeries({
                ...props.series,
                description: e.target.value,
              })
            }
            autosize
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Author(s)</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <TagsInput
            placeholder="Authors..."
            value={props.series.authors}
            onChange={(value) => {
              props.setSeries({
                ...props.series,
                authors: value,
              });
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Artist(s)</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <TagsInput
            placeholder="Artists..."
            value={props.series.artists}
            onChange={(value) => {
              props.setSeries({
                ...props.series,
                artists: value,
              });
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Tags</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <TagsInput
            placeholder="Tags..."
            value={props.series.tags}
            onChange={(value) => {
              props.setSeries({
                ...props.series,
                tags: value,
              });
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Language</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Select
            disabled={!props.editable}
            value={props.series.originalLanguageKey}
            data={Object.values(Languages).map((language: Language) => ({
              value: language.key,
              label: language.name,
            }))}
            onChange={(value) =>
              props.setSeries({
                ...props.series,
                originalLanguageKey: value as LanguageKey,
              })
            }
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text ta="right">Release Status</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Select
            disabled={!props.editable}
            value={props.series.status}
            data={[
              {
                value: SeriesStatus.ONGOING,
                label: SeriesStatus.ONGOING,
              },
              {
                value: SeriesStatus.COMPLETED,
                label: SeriesStatus.COMPLETED,
              },
              { value: SeriesStatus.CANCELLED, label: SeriesStatus.CANCELLED },
            ]}
            onChange={(value) =>
              props.setSeries({
                ...props.series,
                status: value as SeriesStatus,
              })
            }
          />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default SeriesEditControls;
