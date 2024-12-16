import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import routes from '@/common/constants/routes.json';
import { removeSeries } from '@/renderer/features/library/utils';
import { seriesListState } from '@/renderer/state/libraryStates';
import { confirmRemoveSeriesState } from '@/renderer/state/settingStates';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import { Checkbox } from '@/ui/components/Checkbox';
import { Label } from '@/ui/components/Label';

type Props = {
  series: Series | null;
  showing: boolean;
  setShowing: (showing: boolean) => void;
};

export const RemoveSeriesDialog: React.FC<Props> = (props: Props) => {
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
  };

  useEffect(() => {
    setDontAskAgain(false);
  }, [props.showing]);

  return (
    <Dialog
      open={props.showing && props.series !== null}
      onOpenChange={props.setShowing}
      defaultOpen={false}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove series</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to remove {props.series?.title} from your library?</p>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxOptimizeContrast"
            checked={dontAskAgain}
            onCheckedChange={(checked) => setDontAskAgain(checked === true)}
          />
          <Label htmlFor="checkboxOptimizeContrast">Don't ask again</Label>
        </div>
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button variant={'destructive'} type="submit" onClick={() => removeFunc()}>
            Remove from library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
