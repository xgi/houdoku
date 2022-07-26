import React from 'react';
import { Col, Row, Switch } from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import { useRecoilState } from 'recoil';
import styles from './IntegrationSettings.css';
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
      <Row className={styles.row}>
        <Col span={10}>Use Discord Rich Presence</Col>
        <Col span={14}>
          <Switch
            checked={discordPresenceEnabled}
            onChange={(checked: boolean) =>
              updateIntegrationSetting(IntegrationSetting.DiscordPresenceEnabled, checked)
            }
          />
        </Col>
      </Row>
      <Row className={styles.row}>
        <Col span={20}>
          <Paragraph>
            To use Discord Rich Presence, make sure &quot;Display current activity as a status
            message&quot; is enabled in your Discord settings (under the Activity Status tab).
          </Paragraph>
        </Col>
      </Row>
    </>
  );
};

export default IntegrationSettings;
