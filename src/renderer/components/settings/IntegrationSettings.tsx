import React from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox } from '@mantine/core';
import { IntegrationSetting } from '@/common/models/types';
import { discordPresenceEnabledState } from '@/renderer/state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const IntegrationSettings: React.FC<Props> = () => {
  const [discordPresenceEnabled, setDiscordPresenceEnabled] = useRecoilState(
    discordPresenceEnabledState,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateIntegrationSetting = (integrationSetting: IntegrationSetting, value: any) => {
    switch (integrationSetting) {
      case IntegrationSetting.DiscordPresenceEnabled:
        setDiscordPresenceEnabled(value);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <Checkbox
        label="Use Discord Rich Presence"
        size="md"
        checked={discordPresenceEnabled}
        onChange={(e) =>
          updateIntegrationSetting(IntegrationSetting.DiscordPresenceEnabled, e.target.checked)
        }
        description='To use Discord Rich Presence, make sure "Display current activity as a status message" is enabled in your Discord settings (under the Activity Status tab).'
      />
    </>
  );
};

export default IntegrationSettings;
