import React from 'react';
import { useRecoilState } from 'recoil';
import { discordPresenceEnabledState } from '@/renderer/state/settingStates';
import { Checkbox } from '@/ui/components/Checkbox';
import { Label } from '@/ui/components/Label';

export const SettingsIntegrations: React.FC = () => {
  const [discordPresenceEnabled, setDiscordPresenceEnabled] = useRecoilState(
    discordPresenceEnabledState,
  );

  return (
    <>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="checkboxDiscordPresence"
            checked={discordPresenceEnabled}
            onCheckedChange={(checked) => setDiscordPresenceEnabled(checked === true)}
          />
          <Label htmlFor="checkboxDiscordPresence" className="font-normal">
            Use Discord Rich Presence
          </Label>
        </div>
        <p className="text-xs text-muted-foreground">
          To use Discord Rich Presence, make sure "Share your detected activities with others" is
          enabled in your Discord settings (under the Activity Privacy tab).
        </p>
      </div>
    </>
  );
};
