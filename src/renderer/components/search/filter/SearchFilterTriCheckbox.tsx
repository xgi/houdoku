import React from 'react';
import { Group } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { TriState } from '@tiyo/common';
import DefaultText from '../../general/DefaultText';
import DefaultActionIcon from '../../general/DefaultActionIcon';

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
      }[props.value],
    );
  };

  return (
    <Group gap="sm" onClick={toggleValue}>
      <DefaultActionIcon
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
      </DefaultActionIcon>
      <DefaultText size="sm" style={{ cursor: 'default' }}>
        {props.label}
      </DefaultText>
    </Group>
  );
};

export default SearchFilterTriCheckbox;
