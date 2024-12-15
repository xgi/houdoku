import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  FilterCheckbox,
  FilterCycle,
  FilterHeader,
  FilterInput,
  FilterMultiToggle,
  FilterOption,
  FilterOptionType,
  FilterSelect,
  FilterSeparator,
  FilterSort,
  FilterSortValue,
  FilterTriStateCheckbox,
  MultiToggleValues,
  TriState,
} from '@tiyo/common';
import {
  filterValuesMapState,
  searchExtensionState,
  showingFilterDrawerState,
} from '@/renderer/state/searchStates';
import SearchFilterMultiToggle from './filter/SearchFilterMultiToggle';
import SearchFilterSort from './filter/SearchFilterSort';
import SearchFilterTriCheckbox from './filter/SearchFilterTriCheckbox';
import SearchFilterCycle from './filter/SearchFilterCycle';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/ui/components/Sheet';
import { Label } from '@/ui/components/Label';
import { Input } from '@/ui/components/Input';
import { Checkbox } from '@/ui/components/Checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/Select';
import { Separator } from '@/ui/components/Separator';

interface Props {
  filterOptions: FilterOption[];
  onClose?: (wasChanged: boolean) => void;
}

const SearchFilterDrawer: React.FC<Props> = (props: Props) => {
  const searchExtension = useRecoilValue(searchExtensionState);
  const [showingFilterDrawer, setShowingFilterDrawer] = useRecoilState(showingFilterDrawerState);
  const [filterValuesMap, setFilterValuesMap] = useRecoilState(filterValuesMapState);
  const [wasChanged, setWasChanged] = useState(false);

  const getOptionValue = (option: FilterOption): unknown => {
    if (searchExtension in filterValuesMap && option.id in filterValuesMap[searchExtension]) {
      return filterValuesMap[searchExtension][option.id];
    }
    return option.defaultValue;
  };

  const setOptionValue = (optionId: string, value: unknown) => {
    const filterValues = filterValuesMap[searchExtension] || {};
    const newFilterValues = { ...filterValues, [optionId]: value };
    setFilterValuesMap({ ...filterValuesMap, [searchExtension]: newFilterValues });
    setWasChanged(true);
  };

  const renderCheckbox = (option: FilterCheckbox) => {
    return (
      <div key={option.id} className="flex items-center space-x-2">
        <Checkbox
          id={`checkbox${option.id}`}
          checked={getOptionValue(option) as boolean}
          onCheckedChange={(checked) => setOptionValue(option.id, checked)}
          className="w-5 h-5"
        />
        <Label htmlFor={`checkbox${option.id}`}>{option.label}</Label>
      </div>
    );
  };

  const renderTriCheckbox = (option: FilterTriStateCheckbox) => {
    return (
      <SearchFilterTriCheckbox
        key={option.id}
        label={option.label}
        value={getOptionValue(option) as TriState}
        onChange={(value) => setOptionValue(option.id, value)}
      />
    );
  };

  const renderInput = (option: FilterInput) => {
    return (
      <div key={option.id}>
        <Label>{option.label}</Label>
        <Input
          value={getOptionValue(option) as string}
          placeholder={option.placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setOptionValue(option.id, e.target.value)
          }
        />
      </div>
    );
  };

  const renderSelect = (option: FilterSelect) => {
    return (
      <Select
        value={getOptionValue(option) as string}
        defaultValue={(option.defaultValue as string) || undefined}
        onValueChange={(value) => setOptionValue(option.id, value || '')}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {option.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  };

  const renderMultiToggle = (option: FilterMultiToggle) => {
    return (
      <SearchFilterMultiToggle
        key={option.id}
        label={option.label}
        canExclude={option.isTriState}
        fields={option.fields || []}
        values={getOptionValue(option) as MultiToggleValues}
        onChange={(values) => setOptionValue(option.id, values)}
      />
    );
  };

  const renderSort = (option: FilterSort) => {
    return (
      <SearchFilterSort
        key={option.id}
        label={option.label}
        supportsBothDirections={option.supportsBothDirections}
        fields={option.fields || []}
        value={getOptionValue(option) as FilterSortValue}
        onChange={(value) => setOptionValue(option.id, value)}
      />
    );
  };

  const renderCycle = (option: FilterCycle) => {
    return (
      <SearchFilterCycle
        key={option.id}
        label={option.label}
        value={getOptionValue(option) as string}
        options={option.options || []}
        onChange={(value) => setOptionValue(option.id, value)}
      />
    );
  };

  const renderHeader = (option: FilterHeader) => {
    return <h3 key={option.id}>{option.label}</h3>;
  };

  const renderSeparator = (option: FilterSeparator) => {
    return <Separator key={option.id} className="my-2" />;
  };

  const renderControls = () => {
    return props.filterOptions.map((option) => {
      switch (option.kind) {
        case FilterOptionType.Checkbox:
          return renderCheckbox(option as FilterCheckbox);
        case FilterOptionType.TriStateCheckbox:
          return renderTriCheckbox(option as FilterTriStateCheckbox);
        case FilterOptionType.Input:
          return renderInput(option as FilterInput);
        case FilterOptionType.Select:
          return renderSelect(option as FilterSelect);
        case FilterOptionType.MultiToggle:
          return renderMultiToggle(option as FilterMultiToggle);
        case FilterOptionType.Sort:
          return renderSort(option as FilterSort);
        case FilterOptionType.Cycle:
          return renderCycle(option as FilterCycle);
        case FilterOptionType.Header:
          return renderHeader(option as FilterHeader);
        case FilterOptionType.Separator:
          return renderSeparator(option as FilterSeparator);
        default:
          return undefined;
      }
    });
  };

  useEffect(() => {
    if (showingFilterDrawer) setWasChanged(false);
  }, [showingFilterDrawer]);

  return (
    <Sheet
      open={showingFilterDrawer}
      onOpenChange={(open) => {
        if (!open && props.onClose !== undefined) {
          props.onClose(wasChanged);
        }
        setShowingFilterDrawer(open);
      }}
    >
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Search options</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto overflow-x-hidden pr-3 pl-1">
          <div className="flex flex-col space-y-2">{renderControls()}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SearchFilterDrawer;
