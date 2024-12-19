import React, { useEffect, useState } from 'react';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import storeKeys from '@/common/constants/storeKeys.json';
import persistantStore from '@/renderer/util/persistantStore';
import { TrackerMetadata } from '@/common/models/types';
import { Button } from '@houdoku/ui/components/Button';
import { AccordionContent, AccordionTrigger } from '@houdoku/ui/components/Accordion';
import { Label } from '@houdoku/ui/components/Label';
import { Input } from '@houdoku/ui/components/Input';
import { Loader2Icon } from 'lucide-react';

type Props = {
  trackerMetadata: TrackerMetadata;
};

export const TrackerAuthUserPass: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [tempUsername, setTempUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const loadTrackerDetails = async () => {
    setLoading(true);

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

  const submitUserPass = async () => {
    setLoading(true);

    const credentials = JSON.stringify({
      username: tempUsername,
      password: tempPassword,
    });

    await ipcRenderer
      .invoke(ipcChannels.TRACKER.GET_TOKEN, props.trackerMetadata.id, credentials)
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
            <div className="flex flex-col space-y-2 !ml-7">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="trackerUsername">Username</Label>
                <Input
                  type="text"
                  id="trackerUsername"
                  placeholder="Username"
                  onChange={(e) => setTempUsername(e.target.value)}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="trackerPassword">Password</Label>
                <Input
                  type="password"
                  id="trackerPassword"
                  placeholder="Password"
                  onChange={(e) => setTempPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-4 items-center">
            <div className="bg-foreground text-background w-8 h-8 rounded-full flex items-center justify-center">
              <span className="font-bold">2</span>
            </div>
            <div className="!ml-7">
              <Button onClick={() => submitUserPass()}>Submit</Button>
            </div>
          </div>
        </div>
      </AccordionContent>
    </>
  );
};
