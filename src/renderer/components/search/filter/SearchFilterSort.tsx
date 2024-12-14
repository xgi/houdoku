import React from 'react';
import { Menu, ScrollArea } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons';
import { FilterSortValue, SortDirection } from '@tiyo/common';
import DefaultMenu from '../../general/DefaultMenu';
import DefaultButton from '../../general/DefaultButton';

const ICON_MAP = {
  [SortDirection.ASCENDING]: <IconArrowUp size={13} />,
  [SortDirection.DESCENDING]: <IconArrowDown size={13} />,
};

type Props = {
  label: string;
  supportsBothDirections: boolean;
  fields: { key: string; label: string }[];
  value: FilterSortValue;
  onChange: (value: FilterSortValue) => void;
};
const SearchFilterSort: React.FC<Props> = (props: Props) => {
  const toggleValue = (key: string) => {
    if (props.value.key === key && props.supportsBothDirections) {
      props.onChange({
        key,
        direction: {
          [SortDirection.ASCENDING]: SortDirection.DESCENDING,
          [SortDirection.DESCENDING]: SortDirection.ASCENDING,
        }[props.value.direction],
      });
    } else {
      props.onChange({ key, direction: SortDirection.DESCENDING });
    }
  };

  const currentLabel = props.fields.find((field) => field.key === props.value.key)?.label;

  return (
    <DefaultMenu shadow="md" closeOnItemClick={false}>
      <Menu.Target>
        <DefaultButton variant="default">
          {props.label}: {currentLabel}
          {'  '}
          {ICON_MAP[props.value.direction]}
        </DefaultButton>
      </Menu.Target>

      <Menu.Dropdown>
        <ScrollArea.Autosize mah={260} style={{ width: 262 }}>
          {props.fields.map((field) => {
            const icon =
              field.key === props.value.key ? ICON_MAP[props.value.direction] : undefined;

            return (
              <Menu.Item
                key={field.key}
                onClick={() => toggleValue(field.key)}
                rightSection={icon}
                pr="md"
              >
                {field.label}
              </Menu.Item>
            );
          })}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </DefaultMenu>
  );
};

export default SearchFilterSort;
