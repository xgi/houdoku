import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Button, Checkbox, Group, Modal, Text } from '@mantine/core';
import routes from '@/common/constants/routes.json';
import { removeSeries } from '@/renderer/features/library/utils';
import { seriesListState } from '@/renderer/state/libraryStates';
import { confirmRemoveSeriesState } from '@/renderer/state/settingStates';

type Props = {
  series: Series | null;
  showing: boolean;
  close: () => void;
};

const RemoveSeriesModal: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const setSeriesList = useSetRecoilState(seriesListState);
  const setConfirmRemoveSeries = useSetRecoilState(confirmRemoveSeriesState);

  const removeFunc = () => {
    if (props.series !== null) {
      removeSeries(props.series, setSeriesList);

      if (dontAskAgain) setConfirmRemoveSeries(false);
      navigate(routes.LIBRARY);
    }
    props.close();
  };

  useEffect(() => {
    setDontAskAgain(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.showing]);

  return (
    <Modal
      opened={props.showing && props.series !== null}
      centered
      title="Remove series"
      onClose={props.close}
    >
      <Text size="sm" mb="sm">
        Are you sure you want to remove{' '}
        <Text color="teal" inherit component="span" italic>
          {props.series?.title}
        </Text>{' '}
        from your library?
      </Text>
      <Checkbox
        mt="xs"
        label="Don't ask again"
        checked={dontAskAgain}
        onChange={(e) => setDontAskAgain(e.target.checked)}
      />
      <Group position="right" mt="sm">
        <Button variant="default" onClick={props.close}>
          Cancel
        </Button>
        <Button color="red" onClick={removeFunc}>
          Remove from library
        </Button>
      </Group>
    </Modal>
  );
};

export default RemoveSeriesModal;
