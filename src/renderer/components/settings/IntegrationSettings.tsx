import React from 'react';
import { useRecoilState } from 'recoil';
import { IntegrationSetting } from '@/common/models/types';
import { discordPresenceEnabledState } from '@/renderer/state/settingStates';
import DefaultCheckbox from '../general/DefaultCheckbox';

const IntegrationSettings: React.FC = () => {
  const [discordPresenceEnabled, setDiscordPresenceEnabled] = useRecoilState(
    discordPresenceEnabledState,
  );

  // biome-ignore lint/suspicious/noExplicitAny: arbitrary schema
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
      <DefaultCheckbox
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
