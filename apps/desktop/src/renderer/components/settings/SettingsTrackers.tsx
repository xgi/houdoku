import React from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { Alert, AlertDescription, AlertTitle } from '@houdoku/ui/components/Alert';
import { InfoIcon } from 'lucide-react';
import { Accordion, AccordionItem } from '@houdoku/ui/components/Accordion';
import { TrackerAuthOAuth } from './TrackerAuthOAuth';
import {
  AniListTrackerMetadata,
  MALTrackerMetadata,
  MUTrackerMetadata,
} from '@/common/temp_tracker_metadata';
import { trackerAutoUpdateState } from '@/renderer/state/settingStates';
import { TrackerAuthUserPass } from './TrackerAuthUserPass';

export const SettingsTrackers: React.FC = () => {
  const [trackerAutoUpdate, setTrackerAutoUpdate] = useRecoilState(trackerAutoUpdateState);

  return (
    <>
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Syncing progress with trackers</AlertTitle>
        <AlertDescription>
          After authenticating, click the "Trackers" button on a series page to link it with your
          list.
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="checkboxUpdateProgressAutomatically"
          checked={trackerAutoUpdate}
          onCheckedChange={(checked) => setTrackerAutoUpdate(checked === true)}
        />
        <Label htmlFor="checkboxUpdateProgressAutomatically" className="font-normal">
          Update chapter progress automatically
        </Label>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {[AniListTrackerMetadata, MALTrackerMetadata].map((trackerMetadata) => (
          <AccordionItem value={trackerMetadata.id} key={trackerMetadata.id}>
            <TrackerAuthOAuth trackerMetadata={trackerMetadata} />
          </AccordionItem>
        ))}
        {[MUTrackerMetadata].map((trackerMetadata) => (
          <AccordionItem value={trackerMetadata.id} key={trackerMetadata.id}>
            <TrackerAuthUserPass trackerMetadata={trackerMetadata} />
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
};
