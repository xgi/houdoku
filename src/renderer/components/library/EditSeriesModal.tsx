import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { Button, Group, Modal } from '@mantine/core';
import { updateSeries } from '@/renderer/features/library/utils';
import SeriesEditControls from '../general/SeriesEditControls';

type Props = {
  series: Series | undefined;
  visible: boolean;
  saveCallback: (series: Series) => void;
  close: () => void;
};

const EditSeriesModal: React.FC<Props> = (props: Props) => {
  const [customSeries, setCustomSeries] = useState<Series>();

  useEffect(() => {
    setCustomSeries(props.series);
  }, [props.series]);

  const handleSave = () => {
    if (customSeries !== undefined) {
      updateSeries(customSeries)
        .then(() => props.saveCallback(customSeries))
        .catch((err) => console.error(err));
    }
    props.close();
  };

  const renderContent = () => {
    if (customSeries !== undefined) {
      return (
        <>
          <SeriesEditControls
            series={customSeries}
            setSeries={(series: Series) => setCustomSeries(series)}
            editable
          />

          <Group position="right" mt="sm">
            <Button variant="default" onClick={props.close}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Details</Button>
          </Group>
        </>
      );
    }
    return <></>;
  };

  return (
    <Modal title="Edit Series" opened={props.visible} onClose={props.close}>
      {renderContent()}
    </Modal>
  );
};

export default EditSeriesModal;
