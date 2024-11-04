import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Group } from '@mantine/core';
import routes from '@/common/constants/routes.json';
import { removeSeries } from '@/renderer/features/library/utils';
import { seriesListState } from '@/renderer/state/libraryStates';
import { confirmRemoveSeriesState } from '@/renderer/state/settingStates';
import DefaultModal from '../general/DefaultModal';
import DefaultText from '../general/DefaultText';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultButton from '../general/DefaultButton';

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
  }, [props.showing]);

  return (
    <DefaultModal
      opened={props.showing && props.series !== null}
      title="Remove series"
      onClose={props.close}
    >
      <DefaultText size="sm" mb="sm">
        Are you sure you want to remove{' '}
        <DefaultText c="teal" inherit component="span" fs="italic">
          {props.series?.title}
        </DefaultText>{' '}
        from your library?
      </DefaultText>
      <DefaultCheckbox
        mt="xs"
        label="Don't ask again"
        checked={dontAskAgain}
        onChange={(e) => setDontAskAgain(e.target.checked)}
      />
      <Group justify="flex-end" mt="sm">
        <DefaultButton onClick={props.close}>Cancel</DefaultButton>
        <DefaultButton oc="red" onClick={removeFunc}>
          Remove from library
        </DefaultButton>
      </Group>
    </DefaultModal>
  );
};

export default RemoveSeriesModal;
