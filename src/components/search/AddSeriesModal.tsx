import React, { useEffect, useState } from 'react';
import {
  Button,
  Col,
  Dropdown,
  Input,
  Menu,
  Modal,
  Row,
  Select,
  Spin,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import Paragraph from 'antd/lib/typography/Paragraph';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
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
import styles from './AddSeriesModal.css';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';

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
  series: Series | undefined;
  visible: boolean;
  editable: boolean | undefined;
  importSeries: (series: Series) => void;
  toggleVisible: () => void;
};

const AddSeriesModal: React.FC<Props> = (props: Props) => {
  const [customSeries, setCustomSeries] = useState<Series>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (props.series !== undefined) {
      // we can't guarantee the provided series has all of the available fields (since
      // they are not usually included in the search results) so we explicitly retrieve
      // all of the series data here

      log.debug(
        `AddSeriesModal is retrieving details for series ${props.series.sourceId} from extension ${props.series.extensionId}`
      );
      ipcRenderer
        .invoke(
          ipcChannels.EXTENSION.GET_SERIES,
          props.series.extensionId,
          props.series.sourceType,
          props.series.sourceId
        )
        .then((series?: Series) => {
          if (series !== undefined) {
            log.debug(
              `AddSeriesModal found matching series ${series?.sourceId}`
            );
            setCustomSeries(series);
          }
          return series;
        })
        .finally(() => setLoading(false))
        .catch((e) => log.error(e));
    }
  }, [props.series]);

  const handleAdd = () => {
    if (customSeries !== undefined) {
      props.importSeries(customSeries);
      props.toggleVisible();
    }
  };

  if (loading || customSeries === undefined) {
    return (
      <Modal
        title="Add Series to Library"
        visible={props.visible}
        footer={null}
        onCancel={props.toggleVisible}
      >
        <div className={styles.loaderContainer}>
          <Spin />
          <Paragraph>Loading series details...</Paragraph>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Add Series to Library"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <Row className={styles.row}>
        <Col span={2} />
        <Col span={6}>
          <img
            className={styles.coverImage}
            src={
              customSeries.remoteCoverUrl === ''
                ? blankCover
                : customSeries.remoteCoverUrl
            }
            alt={customSeries.title}
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
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.title}
            title={customSeries.title}
            onChange={(e) =>
              setCustomSeries({
                ...customSeries,
                title: e.target.value,
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
            value={customSeries.authors}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.artists}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.genres.map(
              (genreKey: GenreKey) => Genres[genreKey].name
            )}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.themes.map(
              (themeKey: ThemeKey) => Themes[themeKey].name
            )}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.formats.map(
              (formatKey: FormatKey) => Formats[formatKey].name
            )}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
            value={customSeries.contentWarnings.map(
              (contentWarningKey: ContentWarningKey) =>
                ContentWarnings[contentWarningKey].name
            )}
            onChange={(value: string[]) =>
              setCustomSeries({
                ...customSeries,
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
                  setCustomSeries({
                    ...customSeries,
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
              {Demographics[customSeries.demographic].name} <DownOutlined />
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
                  setCustomSeries({
                    ...customSeries,
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
              {Languages[customSeries.originalLanguageKey].name}{' '}
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
                  setCustomSeries({
                    ...customSeries,
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
              {customSeries.status} <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Row className={styles.buttonRow}>
        <Button className={styles.button} onClick={handleAdd}>
          Add Series
        </Button>
      </Row>
    </Modal>
  );
};

export default AddSeriesModal;
