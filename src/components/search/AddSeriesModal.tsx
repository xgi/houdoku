import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Button, Center, Group, Loader, Modal, Stack, Text } from '@mantine/core';
import ipcChannels from '../../constants/ipcChannels.json';
import SeriesEditControls from '../general/SeriesEditControls';
import { importSeries } from '../../features/library/utils';
import library from '../../services/library';
import { downloadCover } from '../../util/download';
import { seriesListState } from '../../state/libraryStates';
import { chapterLanguagesState } from '../../state/settingStates';

type Props = {
  series: Series | undefined;
  visible: boolean;
  editable: boolean | undefined;
  close: () => void;
};

const AddSeriesModal: React.FC<Props> = (props: Props) => {
  const [, setSeriesList] = useRecoilState(seriesListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
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
        .invoke(ipcChannels.EXTENSION.GET_SERIES, props.series.extensionId, props.series.sourceId)
        .then((series?: Series) => {
          if (series !== undefined) {
            log.debug(`AddSeriesModal found matching series ${series?.sourceId}`);
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
      importSeries(customSeries, chapterLanguages)
        // eslint-disable-next-line promise/always-return
        .then((addedSeries) => {
          setSeriesList(library.fetchSeriesList());
          downloadCover(addedSeries);
        })
        .catch((e) => log.error(e));
      props.close();
    }
  };

  const renderContent = () => {
    if (loading || customSeries === undefined) {
      return (
        <Center>
          <Stack align="center">
            <Loader />
            <Text>Loading series details...</Text>
          </Stack>
        </Center>
      );
    }

    return (
      <>
        <SeriesEditControls
          series={customSeries}
          setSeries={(series: Series) => setCustomSeries(series)}
          editable={props.editable === true}
        />

        <Group position="right" mt="sm">
          <Button variant="default" onClick={props.close}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Series</Button>
        </Group>
      </>
    );
  };

  return (
    <Modal title="Add Series" opened={props.visible} onClose={props.close}>
      {renderContent()}
    </Modal>
  );
};

export default AddSeriesModal;
