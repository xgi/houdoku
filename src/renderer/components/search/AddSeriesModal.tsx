import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { SeriesEditControls } from '../general/SeriesEditControls';
import { importingState, importQueueState } from '@/renderer/state/libraryStates';
import { goToSeries } from '@/renderer/features/library/utils';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import { Skeleton } from '@/ui/components/Skeleton';

type Props = {
  series: Series | undefined;
  editable: boolean | undefined;
  showing: boolean;
  setShowing: (showing: boolean) => void;
};

const AddSeriesModal: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [customSeries, setCustomSeries] = useState<Series>();
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [previewSeries, setPreviewSeries] = useState<Series>();
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const importing = useRecoilValue(importingState);

  useEffect(() => {
    setLoadingDetails(true);

    if (props.series !== undefined) {
      // we can't guarantee the provided series has all of the available fields (since
      // they are not usually included in the search results) so we explicitly retrieve
      // all of the series data here

      console.debug(
        `AddSeriesModal is retrieving details for series ${props.series.sourceId} from extension ${props.series.extensionId}`,
      );
      ipcRenderer
        .invoke(ipcChannels.EXTENSION.GET_SERIES, props.series.extensionId, props.series.sourceId)
        .then((series?: Series) => {
          if (series !== undefined) {
            console.debug(`AddSeriesModal found matching series ${series?.sourceId}`);
            setCustomSeries(series);
          }
          return series;
        })
        .finally(() => setLoadingDetails(false))
        .catch((e) => console.error(e));
    }
  }, [props.series]);

  useEffect(() => {
    if (previewSeries && !importing) {
      goToSeries(previewSeries, navigate);
      props.setShowing(false);
    }
  }, [importQueue]);

  const handleAdd = async () => {
    if (customSeries !== undefined) {
      setImportQueue([...importQueue, { series: customSeries, getFirst: false }]);
      props.setShowing(false);
    }
  };

  const handlePreview = async () => {
    if (customSeries !== undefined) {
      const tempPreviewSeries = { ...customSeries, id: uuidv4(), preview: true };
      setPreviewSeries(tempPreviewSeries);
      setImportQueue([...importQueue, { series: tempPreviewSeries, getFirst: false }]);
    }
  };

  return (
    <Dialog open={props.showing} onOpenChange={props.setShowing}>
      <DialogContent className="overflow-y-scroll max-h-screen [@media(min-height:500px)]:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add series</DialogTitle>
        </DialogHeader>
        {loadingDetails || customSeries === undefined ? (
          <div className="flex space-x-4">
            <Skeleton className="w-40 md:w-44 lg:w-48 h-40" />
            <Skeleton className="w-full h-40" />
          </div>
        ) : (
          <SeriesEditControls
            series={customSeries}
            setSeries={(series: Series) => setCustomSeries(series)}
            editable={props.editable === true}
          />
        )}
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button variant={'secondary'} onClick={handlePreview}>
            Preview
          </Button>
          <Button type="submit" onClick={handleAdd}>
            Add series
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSeriesModal;
