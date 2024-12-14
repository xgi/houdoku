import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { TrackerMetadata } from '@/common/models/types';
import { AccordionContent, AccordionTrigger } from '@/ui/components/Accordion';
import { Button } from '@/ui/components/Button';
import { ExternalLinkIcon, Loader2Icon } from 'lucide-react';
import { Input } from '@/ui/components/Input';

type Props = {
  trackerMetadata: TrackerMetadata;
};

export const TrackerAuthOAuth: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [authUrls, setAuthUrls] = useState<{ [trackerId: string]: string }>({});
  const [username, setUsername] = useState<string | null>(null);

  const loadTrackerDetails = async () => {
    setLoading(true);

    setAuthUrls(
      await ipcRenderer.invoke(ipcChannels.TRACKER.GET_AUTH_URLS).catch((e) => console.error(e)),
    );
    setUsername(
      await ipcRenderer
        .invoke(ipcChannels.TRACKER.GET_USERNAME, props.trackerMetadata.id)
        .catch((e) => console.error(e)),
    );

    setLoading(false);
  };

  const saveAccessToken = async (accessToken: string) => {
    setLoading(true);

    persistantStore.write(
      `${storeKeys.TRACKER_ACCESS_TOKEN_PREFIX}${props.trackerMetadata.id}`,
      accessToken,
    );
    await ipcRenderer
      .invoke(ipcChannels.TRACKER.SET_ACCESS_TOKEN, props.trackerMetadata.id, accessToken)
      .catch((e) => console.error(e));

    loadTrackerDetails();
  };

  const submitAccessCode = async () => {
    setLoading(true);

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, props.trackerMetadata.id, accessCode)
      .then((token: string | null) => saveAccessToken(token || ''))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    loadTrackerDetails();
  }, []);

  if (loading) {
    return (
      <AccordionTrigger className="hover:no-underline" disabled>
        <div className="flex items-center space-x-2">
          <Loader2Icon className="animate-spin w-4 h-4" />
          <span>Loading {props.trackerMetadata.name} details...</span>
        </div>
      </AccordionTrigger>
    );
  }

  return (
    <>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex justify-between items-center w-full pr-2">
          <span>{props.trackerMetadata.name}</span>
          {username ? (
            <div className="flex space-x-2">
              <span>
                Logged in as{' '}
                <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                  {username}
                </code>
              </span>
              <Button
                size="sm"
                variant={'destructive'}
                className="!h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  saveAccessToken('');
                }}
              >
                Unlink
              </Button>
            </div>
          ) : (
            <span>Not logged in.</span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col space-y-2">
          <div className="flex space-x-4 items-center">
            <div className="bg-foreground text-background w-8 h-8 rounded-full flex items-center justify-center">
              <span className="font-bold">1</span>
            </div>
            <Button variant="link" asChild>
              <a href={authUrls[props.trackerMetadata.id]} target="_blank">
                Authenticate on {props.trackerMetadata.name}
                <ExternalLinkIcon />
              </a>
            </Button>
          </div>

          <div className="flex space-x-4 items-center">
            <div className="bg-foreground text-background w-8 h-8 rounded-full flex items-center justify-center">
              <span className="font-bold">2</span>
            </div>
            <div>
              <Input
                className="w-full ml-3"
                value={accessCode || ''}
                placeholder="Paste access code..."
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccessCode(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4 items-center">
            <div className="bg-foreground text-background w-8 h-8 rounded-full flex items-center justify-center">
              <span className="font-bold">3</span>
            </div>
            <div className="!ml-7">
              <Button onClick={() => submitAccessCode()}>Submit</Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </>
  );
};
