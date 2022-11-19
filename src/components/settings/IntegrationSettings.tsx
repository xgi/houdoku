import React from 'react';
import { useRecoilState } from 'recoil';
import { Checkbox, Grid, Switch, Text } from '@mantine/core';
import { IntegrationSetting } from '../../models/types';
import { discordPresenceEnabledState } from '../../state/settingStates';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const IntegrationSettings: React.FC<Props> = (props: Props) => {
  const [discordPresenceEnabled, setDiscordPresenceEnabled] = useRecoilState(
    discordPresenceEnabledState
  );

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
      />
      <Text color="dimmed" ml="sm">
        To use Discord Rich Presence, make sure &quot;Display current activity as a status
        message&quot; is enabled in your Discord settings (under the Activity Status tab).
      </Text>
    </>
  );
};

export default IntegrationSettings;
