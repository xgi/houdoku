import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { updateSeries } from '@/renderer/features/library/utils';
import { SeriesEditControls } from '../general/SeriesEditControls';
import { Button } from '@/ui/components/Button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/components/AlertDialog';

type Props = {
  series: Series | undefined;
  showing: boolean;
  setShowing: (showing: boolean) => void;
  save: (series: Series) => void;
};

const EditSeriesModal: React.FC<Props> = (props: Props) => {
  const [customSeries, setCustomSeries] = useState<Series>();

  useEffect(() => {
    setCustomSeries(props.series);
  }, [props.series]);

  const handleSave = () => {
    if (customSeries !== undefined) {
      updateSeries(customSeries)
        .then(() => props.save(customSeries))
        .catch((err) => console.error(err));
    }
    props.setShowing(false);
  };

  return (
    <AlertDialog open={props.showing} onOpenChange={props.setShowing}>
      <AlertDialogContent className="overflow-y-scroll max-h-screen [@media(min-height:500px)]:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit series</AlertDialogTitle>
        </AlertDialogHeader>
        {customSeries !== undefined && (
          <SeriesEditControls
            series={customSeries}
            setSeries={(series: Series) => setCustomSeries(series)}
            editable
          />
        )}
        <AlertDialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSave}>
            Save details
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EditSeriesModal;
