import React from 'react';
import { MultiToggleValues, TriState } from '@tiyo/common';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@houdoku/ui/components/Select';
import { CheckIcon, XIcon } from 'lucide-react';
import { Badge } from '@houdoku/ui/components/Badge';

const TRISTATE_VALUE_MAP = {
  [TriState.IGNORE]: 'ignore',
  [TriState.INCLUDE]: 'include',
  [TriState.EXCLUDE]: 'exclude',
};

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
    <Select value="placeholder">
      <SelectTrigger>
        <SelectValue onContextMenu={() => props.onChange({})}>
          <div className="flex space-x-2">
            {numNonIgnored > 0 && <Badge>{numNonIgnored}</Badge>}
            <span>{props.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.fields.map((field) => {
            const value = Object.keys(props.values).includes(field.key)
              ? props.values[field.key]
              : TriState.IGNORE;
            const icon = {
              [TriState.IGNORE]: <div className="w-4 h-4" />,
              [TriState.INCLUDE]: <CheckIcon className="w-4 h-4" />,
              [TriState.EXCLUDE]: <XIcon className="w-4 h-4" />,
            }[value];

            return (
              <SelectItem
                key={field.key}
                value={TRISTATE_VALUE_MAP[value]}
                data-value={value}
                onClick={(e) => {
                  e.preventDefault();
                  toggleValue(field.key, value);
                }}
                onContextMenu={() => setValue(field.key, TriState.IGNORE)}
              >
                <div className="flex space-x-2 items-center">
                  {icon}
                  <span>{field.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SearchFilterMultiToggle;
