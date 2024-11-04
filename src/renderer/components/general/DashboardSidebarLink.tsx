import React from 'react';
import { Group, ThemeIcon, UnstyledButton } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardSidebarLink.module.css';
import { useRecoilValue } from 'recoil';
import { themeState } from '@/renderer/state/settingStates';
import { themeProps } from '@/renderer/util/themes';
import DefaultText from './DefaultText';

interface Props {
  icon: React.ReactNode;
  color: string;
  label: string;
  route: string;
}

const DashboardSidebarLink: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const theme = useRecoilValue(themeState);

  return (
    <UnstyledButton
      {...themeProps(theme)}
      display={'block'}
      w="100%"
      p={'xs'}
      className={styles.button}
      onClick={() => navigate(props.route)}
    >
      <Group>
        <ThemeIcon
          {...themeProps(theme)}
          data-color={props.color}
          classNames={{ root: styles.icon }}
          variant="light"
        >
          {props.icon}
        </ThemeIcon>
        <DefaultText size="sm">{props.label}</DefaultText>
      </Group>
    </UnstyledButton>
  );
};

export default DashboardSidebarLink;
