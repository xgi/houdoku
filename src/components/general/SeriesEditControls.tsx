import React from 'react';
import { Button, Col, Dropdown, Input, Menu, Row, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import {
  ContentWarning,
  ContentWarningKey,
  Format,
  FormatKey,
  Genre,
  GenreKey,
  Language,
  Series,
  SeriesStatus,
  Theme,
  ThemeKey,
  Languages,
  Genres,
  Themes,
  Formats,
  ContentWarnings,
  genreKeysFromNames,
  themeKeysFromNames,
  formatKeysFromNames,
  contentWarningKeysFromNames,
  Demographics,
  Demographic,
} from 'houdoku-extension-lib';
import styles from './SeriesEditControls.css';
import blankCover from '../../img/blank_cover.png';

const { Option } = Select;

const genreOptions = Object.values(Genres)
  .sort((a: Genre, b: Genre) => a.name.localeCompare(b.name))
  .map((genre: Genre) => (
    <Option key={genre.name} value={genre.name}>
      {genre.name}
    </Option>
  ));

const themeOptions = Object.values(Themes)
  .sort((a: Theme, b: Theme) => a.name.localeCompare(b.name))
  .map((theme: Theme) => (
    <Option key={theme.name} value={theme.name}>
      {theme.name}
    </Option>
  ));

const formatOptions = Object.values(Formats)
  .sort((a: Format, b: Format) => a.name.localeCompare(b.name))
  .map((format: Format) => (
    <Option key={format.name} value={format.name}>
      {format.name}
    </Option>
  ));

const contentWarningOptions = Object.values(ContentWarnings)
  .sort((a: ContentWarning, b: ContentWarning) => a.name.localeCompare(b.name))
  .map((contentWarning: ContentWarning) => (
    <Option key={contentWarning.name} value={contentWarning.name}>
      {contentWarning.name}
    </Option>
  ));

type Props = {
  series: Series;
  setSeries: (series: Series) => void;
  editable: boolean;
};

const SeriesEditControls: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Row className={styles.row}>
        <Col span={2} />
        <Col span={6}>
          <img
            className={styles.coverImage}
            src={
              props.series.remoteCoverUrl === ''
                ? blankCover
                : props.series.remoteCoverUrl
            }
            alt={props.series.title}
          />
        </Col>
        <Col span={2} />
        <Col span={14}>
          <Paragraph style={{ marginTop: '2rem' }}>
            Upload Cover Image
          </Paragraph>
          <input
            type="file"
            onChange={(e: any) =>
              props.setSeries({
                ...props.series,
                remoteCoverUrl: e.target.files[0].path,
              })
            }
          />
        </Col>
      </Row>

      <Row className={styles.row}>
        <Col span={10}>Title</Col>
        <Col span={14}>
          <Input
            value={props.series.title}
            title={props.series.title}
            onChange={(e) =>
              props.setSeries({
                ...props.series,
                title: e.target.value,
              })
            }
            disabled={!props.editable}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Description</Col>
        <Col span={14}>
          <Input
            value={props.series.description}
            title={props.series.description}
            onChange={(e) =>
              props.setSeries({
                ...props.series,
                description: e.target.value,
              })
            }
            disabled={!props.editable}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Author(s)</Col>
        <Col span={14}>
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
            placeholder="Authors..."
            value={props.series.authors}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                authors: value,
              })
            }
            disabled={!props.editable}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Artist(s)</Col>
        <Col span={14}>
          <Select
            mode="tags"
            allowClear
            style={{ width: '100%' }}
            placeholder="Artists..."
            value={props.series.artists}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                artists: value,
              })
            }
            disabled={!props.editable}
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Genres</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Genres..."
            value={props.series.genres.map(
              (genreKey: GenreKey) => Genres[genreKey].name
            )}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                genres: genreKeysFromNames(value).filter(
                  (entry) => entry !== null
                ) as GenreKey[],
              })
            }
            disabled={!props.editable}
          >
            {genreOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Themes</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Themes..."
            value={props.series.themes.map(
              (themeKey: ThemeKey) => Themes[themeKey].name
            )}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                themes: themeKeysFromNames(value).filter(
                  (entry) => entry !== null
                ) as ThemeKey[],
              })
            }
            disabled={!props.editable}
          >
            {themeOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Formats</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Formats..."
            value={props.series.formats.map(
              (formatKey: FormatKey) => Formats[formatKey].name
            )}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                formats: formatKeysFromNames(value).filter(
                  (entry) => entry !== null
                ) as FormatKey[],
              })
            }
            disabled={!props.editable}
          >
            {formatOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Content Warnings</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Content warnings..."
            value={props.series.contentWarnings.map(
              (contentWarningKey: ContentWarningKey) =>
                ContentWarnings[contentWarningKey].name
            )}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                contentWarnings: contentWarningKeysFromNames(value).filter(
                  (entry) => entry !== null
                ) as ContentWarningKey[],
              })
            }
            disabled={!props.editable}
          >
            {contentWarningOptions}
          </Select>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Demographic</Col>
        <Col span={14}>
          <Dropdown
            disabled={!props.editable}
            overlay={
              <Menu
                onClick={(e: any) => {
                  props.setSeries({
                    ...props.series,
                    demographic: e.item.props['data-value'],
                  });
                }}
              >
                {Object.values(Demographics).map((demographic: Demographic) => (
                  <Menu.Item key={demographic.key} data-value={demographic.key}>
                    {demographic.name}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button>
              {Demographics[props.series.demographic].name} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Original Language</Col>
        <Col span={14}>
          <Dropdown
            disabled={!props.editable}
            overlay={
              <Menu
                onClick={(e: any) => {
                  props.setSeries({
                    ...props.series,
                    originalLanguageKey: e.item.props['data-value'],
                  });
                }}
              >
                {Object.values(Languages).map((language: Language) => (
                  <Menu.Item key={language.key} data-value={language.key}>
                    {language.name}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button>
              {Languages[props.series.originalLanguageKey].name}{' '}
              <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Release Status</Col>
        <Col span={14}>
          <Dropdown
            disabled={!props.editable}
            overlay={
              <Menu
                onClick={(e: any) => {
                  props.setSeries({
                    ...props.series,
                    status: e.item.props['data-value'],
                  });
                }}
              >
                <Menu.Item
                  key={SeriesStatus.ONGOING}
                  data-value={SeriesStatus.ONGOING}
                >
                  Ongoing
                </Menu.Item>
                <Menu.Item
                  key={SeriesStatus.COMPLETED}
                  data-value={SeriesStatus.COMPLETED}
                >
                  Completed
                </Menu.Item>
                <Menu.Item
                  key={SeriesStatus.CANCELLED}
                  data-value={SeriesStatus.CANCELLED}
                >
                  Cancelled
                </Menu.Item>
              </Menu>
            }
          >
            <Button>
              {props.series.status} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </>
  );
};

export default SeriesEditControls;
