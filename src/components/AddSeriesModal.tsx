import React from 'react';
import { Button, Col, Dropdown, Input, Menu, Modal, Row } from 'antd';
import { Format, Genre, Series, SeriesStatus, Theme } from '../models/types';
import styles from './AddSeriesModal.css';
import { Languages } from '../models/languages';

type Props = {
  series: Series | undefined;
  visible: boolean;
  toggleVisible: () => void;
};

const AddSeriesModal: React.FC<Props> = (props: Props) => {
  if (props.series === undefined) return <></>;

  return (
    <Modal
      title="Add Series to Library"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <Row className={styles.row}>
        <Col span={10}>Title</Col>
        <Col span={14}>
          <Input
            value={props.series.title}
            title={props.series.title}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Author(s)</Col>
        <Col span={14}>
          <Input
            value={props.series.authors.join(';')}
            title={props.series.authors.join(';')}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Artist(s)</Col>
        <Col span={14}>
          <Input
            value={props.series.artists.join(';')}
            title={props.series.artists.join(';')}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Genres</Col>
        <Col span={14}>
          <Input
            value={props.series.genres
              .map((genre: Genre) => Genre[genre])
              .join('; ')}
            title={props.series.genres
              .map((genre: Genre) => Genre[genre])
              .join('; ')}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Themes</Col>
        <Col span={14}>
          <Input
            value={props.series.themes
              .map((theme: Theme) => Theme[theme])
              .join('; ')}
            title={props.series.themes
              .map((theme: Theme) => Theme[theme])
              .join('; ')}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Formats</Col>
        <Col span={14}>
          <Input
            value={props.series.formats
              .map((format: Format) => Format[format])
              .join('; ')}
            title={props.series.formats
              .map((format: Format) => Format[format])
              .join('; ')}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Original Language</Col>
        <Col span={14}>
          <Input
            value={Languages[props.series.originalLanguageKey].name}
            title={Languages[props.series.originalLanguageKey].name}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={10}>Release Status</Col>
        <Col span={14}>
          <Input
            value={SeriesStatus[props.series.status]}
            title={SeriesStatus[props.series.status]}
            disabled
          />
        </Col>
      </Row>
      <Row className={styles.buttonRow}>
        <Button className={styles.button}>Add Series</Button>
      </Row>
    </Modal>
  );
};

export default AddSeriesModal;
