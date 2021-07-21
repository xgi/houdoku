import React, { useEffect, useState } from 'react';
import { Button, Modal, Row, Spin } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import styles from './EditSeriesModal.css';
import { updateSeries } from '../../features/library/utils';
import SeriesEditControls from '../general/SeriesEditControls';

type Props = {
  series: Series | undefined;
  visible: boolean;
  editable: boolean | undefined;
  toggleVisible: () => void;
  saveCallback: (series: Series) => void;
};

const EditSeriesModal: React.FC<Props> = (props: Props) => {
  const [customSeries, setCustomSeries] = useState<Series>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setCustomSeries(props.series);
    setLoading(false);
  }, [props.series]);

  const handleSave = () => {
    if (customSeries !== undefined) {
      updateSeries(customSeries)
        .then(() => props.saveCallback(customSeries))
        .catch((err) => log.error(err));
    }
    props.toggleVisible();
  };

  if (loading || customSeries === undefined) {
    return (
      <Modal
        title="Edit Series Details"
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
      title="Edit Series Details"
      visible={props.visible}
      footer={null}
      onCancel={props.toggleVisible}
    >
      <SeriesEditControls
        series={customSeries}
        setSeries={(series: Series) => setCustomSeries(series)}
        editable={props.editable === true}
      />
      <Row className={styles.buttonRow}>
        <Button className={styles.button} onClick={handleSave}>
          Save Details
        </Button>
      </Row>
    </Modal>
  );
};

export default EditSeriesModal;
