import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { Group, ScrollArea } from '@mantine/core';
import { updateSeries } from '@/renderer/features/library/utils';
import SeriesEditControls from '../general/SeriesEditControls';
import DefaultModal from '../general/DefaultModal';
import DefaultButton from '../general/DefaultButton';

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
            <DefaultButton onClick={props.close}>Cancel</DefaultButton>
            <DefaultButton oc="blue" onClick={handleSave}>
              Save Details
            </DefaultButton>
          </Group>
        </>
      );
    }
    return <></>;
  };

  return (
    <DefaultModal
      opened={props.visible}
      title="Edit Series"
      onClose={props.close}
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {renderContent()}
    </DefaultModal>
  );
};

export default EditSeriesModal;
