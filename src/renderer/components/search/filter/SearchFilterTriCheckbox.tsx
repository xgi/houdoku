import React from 'react';
import { Text, ActionIcon, Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { TriState } from '@tiyo/common';

type Props = {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
};

const SearchFilterTriCheckbox: React.FC<Props> = (props: Props) => {
  const toggleValue = () => {
    props.onChange(
      {
        [TriState.IGNORE]: TriState.INCLUDE,
        [TriState.INCLUDE]: TriState.EXCLUDE,
        [TriState.EXCLUDE]: TriState.IGNORE,
      }[props.value]
    );
  };

  return (
    <Group spacing="sm" onClick={toggleValue}>
      <ActionIcon
        variant={props.value === TriState.IGNORE ? 'default' : 'filled'}
        color="blue"
        size="sm"
      >
        {
          {
            [TriState.IGNORE]: undefined,
            [TriState.INCLUDE]: <IconCheck size={16} />,
            [TriState.EXCLUDE]: <IconX size={16} />,
          }[props.value]
        }
      </ActionIcon>
      <Text size="sm" style={{ cursor: 'default' }}>
        {props.label}
      </Text>
    </Group>
  );
};

export default SearchFilterTriCheckbox;
