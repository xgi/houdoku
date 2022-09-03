import React from 'react';
import { Group, ThemeIcon, UnstyledButton, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

interface Props {
  icon: React.ReactNode;
  color: string;
  label: string;
  route: string;
}

const DashboardSidebarLink: React.FC<Props> = (props: Props) => {
  return (
    <Link to={props.route}>
      <UnstyledButton
        sx={(theme) => ({
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

          '&:hover': {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          },
        })}
      >
        <Group>
          <ThemeIcon color={props.color} variant="light">
            {props.icon}
          </ThemeIcon>

          <Text size="sm">{props.label}</Text>
        </Group>
      </UnstyledButton>
    </Link>
  );
};

export default DashboardSidebarLink;
