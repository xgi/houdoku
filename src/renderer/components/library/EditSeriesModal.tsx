import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { Button, Group, Modal, ScrollArea } from '@mantine/core';
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

          <Group justify="flex-end" mt="sm">
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
    <Modal.Root
      opened={props.visible}
      onClose={props.close}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Modal.Overlay />
      <Modal.Content style={{ overflow: 'hidden' }}>
        <Modal.Header>
          <Modal.Title>Edit Series</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>{renderContent()}</Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default EditSeriesModal;
