import React, { useState } from 'react';
import { Series } from 'houdoku-extension-lib';
import { useHistory } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';
import { Button, Checkbox, Group, Modal, Text } from '@mantine/core';
import ipcChannels from '../../constants/ipcChannels.json';
import routes from '../../constants/routes.json';
import { removeSeries } from '../../features/library/utils';
import { seriesListState } from '../../state/libraryStates';
import { customDownloadsDirState } from '../../state/settingStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series | null;
  showing: boolean;
  close: () => void;
};

const RemoveSeriesModal: React.FC<Props> = (props: Props) => {
  const history = useHistory();
  const [deleteDownloads, setDeleteDownloads] = useState(false);
  const setSeriesList = useSetRecoilState(seriesListState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);

  const removeFunc = () => {
    if (props.series !== null) {
      removeSeries(
        props.series,
        setSeriesList,
        deleteDownloads,
        customDownloadsDir || defaultDownloadsDir
      );
      history.push(routes.LIBRARY);
    }
    props.close();
  };

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
        label="Also delete downloaded chapters"
        checked={deleteDownloads}
        onChange={(e) => setDeleteDownloads(e.target.checked)}
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
