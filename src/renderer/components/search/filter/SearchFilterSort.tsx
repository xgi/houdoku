import React from 'react';
import { FilterSortValue, SortDirection } from '@tiyo/common';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Button } from '@/ui/components/Button';
import { ArrowDown, ArrowUp } from 'lucide-react';

const ICON_MAP = {
  [SortDirection.ASCENDING]: <ArrowUp className="w-4 h-4" />,
  [SortDirection.DESCENDING]: <ArrowDown className="w-4 h-4" />,
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {props.label}: {currentLabel}
          {'  '}
          {ICON_MAP[props.value.direction]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          {props.fields.map((field) => {
            const icon =
              field.key === props.value.key ? ICON_MAP[props.value.direction] : undefined;

            return (
              <DropdownMenuItem
                key={field.key}
                onClick={(e) => {
                  e.preventDefault();
                  toggleValue(field.key);
                }}
                // rightSection={icon}
              >
                {field.label}
                <DropdownMenuShortcut>{icon !== undefined && icon}</DropdownMenuShortcut>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SearchFilterSort;
