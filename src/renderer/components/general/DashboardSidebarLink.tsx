import React from 'react';
import { Group, ThemeIcon, UnstyledButton, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardSidebarLink.module.css';

interface Props {
  icon: React.ReactNode;
  color: string;
  label: string;
  route: string;
}

const DashboardSidebarLink: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();

  return (
    <UnstyledButton
      display={'block'}
      w="100%"
      p={'xs'}
      className={styles.button}
      onClick={() => navigate(props.route)}
    >
      <Group>
        <ThemeIcon color={props.color} variant="light">
          {props.icon}
        </ThemeIcon>

        <Text size="sm">{props.label}</Text>
      </Group>
    </UnstyledButton>
  );
};

export default DashboardSidebarLink;
