import React from 'react';
import { Button, Col, Dropdown, Menu, Row } from 'antd';
import { DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Language, Series, SeriesStatus, Languages, LanguageKey } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import {
  ActionIcon,
  Center,
  Grid,
  Group,
  Input,
  MultiSelect,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { IconUpload } from '@tabler/icons';
import styles from './SeriesEditControls.css';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';
import constants from '../../constants/constants.json';

type Props = {
  series: Series;
  setSeries: (series: Series) => void;
  editable: boolean;
};

const SeriesEditControls: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Grid gutter="xs">
        <Grid.Col span={4}>
          <img
            className={styles.coverImage}
            src={props.series.remoteCoverUrl === '' ? blankCover : props.series.remoteCoverUrl}
            alt={props.series.title}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <Stack justify="end" style={{ height: '100%' }}>
            <Group noWrap>
              <Input
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
                      'Select Series Cover'
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
          <Text align="right">Title</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Input
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
          <Text align="right">Description</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Input
            disabled={!props.editable}
            value={props.series.description}
            title={props.series.description}
            placeholder="Description..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              props.setSeries({
                ...props.series,
                description: e.target.value,
              })
            }
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text align="right">Author(s)</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <MultiSelect
            data={props.series.authors.map((author) => ({ value: author, label: author }))}
            placeholder="Authors..."
            disabled={!props.editable}
            creatable
            searchable
            value={props.series.authors}
            onChange={(value) =>
              props.setSeries({
                ...props.series,
                authors: value,
              })
            }
            getCreateLabel={(value) => `+ ${value}`}
            onCreate={(value) => {
              props.setSeries({
                ...props.series,
                authors: [...props.series.authors, value],
              });
              return { value, label: value };
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text align="right">Artist(s)</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <MultiSelect
            data={props.series.artists.map((artist) => ({ value: artist, label: artist }))}
            placeholder="Artists..."
            disabled={!props.editable}
            creatable
            searchable
            value={props.series.artists}
            onChange={(value) =>
              props.setSeries({
                ...props.series,
                artists: value,
              })
            }
            getCreateLabel={(value) => `+ ${value}`}
            onCreate={(value) => {
              props.setSeries({
                ...props.series,
                artists: [...props.series.artists, value],
              });
              return { value, label: value };
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text align="right">Tags</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <MultiSelect
            data={props.series.tags.map((tag) => ({ value: tag, label: tag }))}
            placeholder="Tags..."
            disabled={!props.editable}
            creatable
            searchable
            value={props.series.tags}
            onChange={(value) =>
              props.setSeries({
                ...props.series,
                tags: value,
              })
            }
            getCreateLabel={(value) => `+ ${value}`}
            onCreate={(value) => {
              props.setSeries({
                ...props.series,
                tags: [...props.series.tags, value],
              });
              return { value, label: value };
            }}
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text align="right">Language</Text>
        </Grid.Col>
        <Grid.Col span={8}>
          <Select
            disabled={!props.editable}
            value={props.series.originalLanguageKey}
            data={Object.values(Languages).map((language: Language) => ({
              value: language.key,
              label: language.name,
            }))}
            onChange={(value: LanguageKey) =>
              props.setSeries({
                ...props.series,
                originalLanguageKey: value,
              })
            }
          />
        </Grid.Col>

        <Grid.Col span={4} mt={5}>
          <Text align="right">Release Status</Text>
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
            onChange={(value: SeriesStatus) =>
              props.setSeries({
                ...props.series,
                status: value,
              })
            }
          />
        </Grid.Col>
      </Grid>
    </>
  );
};

export default SeriesEditControls;
