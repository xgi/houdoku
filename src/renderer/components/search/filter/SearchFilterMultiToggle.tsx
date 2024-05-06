import React from 'react';
import { Menu, ScrollArea, Button, Text, Grid } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { MultiToggleValues, TriState } from '@tiyo/common';

type Props = {
  label: string;
  canExclude?: boolean;
  fields: { key: string; label: string }[];
  values: MultiToggleValues;
  onChange: (toggleValues: MultiToggleValues) => void;
};

const SearchFilterMultiToggle: React.FC<Props> = (props: Props) => {
  const setValue = (key: string, value: TriState) => {
    props.onChange({ ...props.values, [key]: value });
  };

  const toggleValue = (key: string, currentValue: TriState) => {
    const newValue = {
      [TriState.IGNORE]: TriState.INCLUDE,
      [TriState.INCLUDE]: props.canExclude ? TriState.EXCLUDE : TriState.IGNORE,
      [TriState.EXCLUDE]: TriState.IGNORE,
    }[currentValue];
    setValue(key, newValue);
  };

  const numNonIgnored = Object.entries(props.values).reduce(
    (sum, [, value]) => sum + (value === TriState.IGNORE ? 0 : 1),
    0,
  );

  return (
    <Menu
      shadow="md"
      closeOnItemClick={false}
      styles={(theme) => ({
        item: {
          borderRadius: 0,
          '&[data-value="1"]': {
            backgroundColor: theme.colors.teal[9],
            color: theme.colors.gray[0],
          },
          '&[data-value="2"]': {
            backgroundColor: theme.colors.red[9],
            color: theme.colors.gray[0],
          },
        },
      })}
    >
      <Menu.Target>
        <Button variant="default" onContextMenu={() => props.onChange({})}>
          <Grid style={{ width: 500 }}>
            <Grid.Col span={2} />
            <Grid.Col span={8}>
              <Text ta="center">{props.label}</Text>
            </Grid.Col>
            <Grid.Col span={2}>
              <Text ta="right">{numNonIgnored || undefined}</Text>
            </Grid.Col>
          </Grid>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea.Autosize mah={260} style={{ width: 262 }}>
          {props.fields.map((field) => {
            const value = Object.keys(props.values).includes(field.key)
              ? props.values[field.key]
              : TriState.IGNORE;
            const icon = {
              [TriState.IGNORE]: undefined,
              [TriState.INCLUDE]: <IconCheck size={13} />,
              [TriState.EXCLUDE]: <IconX size={13} />,
            }[value];

            return (
              <Menu.Item
                key={field.key}
                data-value={value}
                onClick={() => toggleValue(field.key, value)}
                onContextMenu={() => setValue(field.key, TriState.IGNORE)}
                rightSection={icon}
                pr="md"
              >
                {field.label}
              </Menu.Item>
            );
          })}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
};

export default SearchFilterMultiToggle;
