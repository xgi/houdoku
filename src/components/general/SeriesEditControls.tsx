import React from 'react';
import { Button, Col, Dropdown, Input, Menu, Row, Select } from 'antd';
import { DownOutlined, UploadOutlined } from '@ant-design/icons';
import { Language, Series, SeriesStatus, Languages } from 'houdoku-extension-lib';
import { ipcRenderer } from 'electron';
import styles from './SeriesEditControls.css';
import blankCover from '../../img/blank_cover.png';
import ipcChannels from '../../constants/ipcChannels.json';
import constants from '../../constants/constants.json';

const { Option } = Select;

type Props = {
  series: Series;
  setSeries: (series: Series) => void;
  editable: boolean;
};

const SeriesEditControls: React.FC<Props> = (props: Props) => {
  return (
    <>
      <Row className={styles.row}>
        <Col span={3} />
        <Col span={5}>
          <img
            className={styles.coverImage}
            src={props.series.remoteCoverUrl === '' ? blankCover : props.series.remoteCoverUrl}
            alt={props.series.title}
          />
        </Col>
        <Col span={2} />
        <Col span={14}>
          <div className={styles.coverControlContainer}>
            Cover Image
            <Row>
              <Col span={20}>
                <Input
                  value={props.series.remoteCoverUrl}
                  title={props.series.remoteCoverUrl}
                  placeholder="Cover URL..."
                  disabled
                />
              </Col>
              <Col span={1} />
              <Col span={2}>
                <Button
                  icon={<UploadOutlined />}
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
                />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row className={styles.row}>
        <Col span={10}>Title</Col>
        <Col span={14}>
          <Input
            value={props.series.title}
            title={props.series.title}
            placeholder="Title..."
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
            placeholder="Description..."
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
        <Col span={10}>Tags</Col>
        <Col span={14}>
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Tags..."
            value={props.series.tags}
            onChange={(value: string[]) =>
              props.setSeries({
                ...props.series,
                tags: value,
              })
            }
            disabled={!props.editable}
          >
            {props.series.tags.map((tag: string) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
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
              {Languages[props.series.originalLanguageKey].name} <DownOutlined />
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
                <Menu.Item key={SeriesStatus.ONGOING} data-value={SeriesStatus.ONGOING}>
                  Ongoing
                </Menu.Item>
                <Menu.Item key={SeriesStatus.COMPLETED} data-value={SeriesStatus.COMPLETED}>
                  Completed
                </Menu.Item>
                <Menu.Item key={SeriesStatus.CANCELLED} data-value={SeriesStatus.CANCELLED}>
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
