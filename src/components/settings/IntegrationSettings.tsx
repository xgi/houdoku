import React from 'react';
import { useRecoilState } from 'recoil';
import { Grid, Switch, Text } from '@mantine/core';
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
    <Grid>
      <Grid.Col span={5}>Use Discord Rich Presence</Grid.Col>
      <Grid.Col span={7}>
        <Switch
          size="md"
          checked={discordPresenceEnabled}
          onChange={(e) =>
            updateIntegrationSetting(IntegrationSetting.DiscordPresenceEnabled, e.target.checked)
          }
        />
      </Grid.Col>
      <Grid.Col span={12}>
        <Text color="dimmed">
          To use Discord Rich Presence, make sure &quot;Display current activity as a status
          message&quot; is enabled in your Discord settings (under the Activity Status tab).
        </Text>
      </Grid.Col>
    </Grid>
  );
};

export default IntegrationSettings;
