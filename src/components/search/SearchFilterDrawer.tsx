import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Checkbox,
  Divider,
  Drawer,
  ScrollArea,
  Select,
  Stack,
  TextInput,
  Title,
  TitleOrder,
} from '@mantine/core';
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
} from 'houdoku-extension-lib';
import {
  filterValuesMapState,
  searchExtensionState,
  showingFilterDrawerState,
} from '../../state/searchStates';
import SearchFilterMultiToggle from './filter/SearchFilterMultiToggle';
import SearchFilterSort from './filter/SearchFilterSort';
import SearchFilterTriCheckbox from './filter/SearchFilterTriCheckbox';
import SearchFilterCycle from './filter/SearchFilterCycle';

interface Props {
  filterOptions: FilterOption[];
  onClose?: () => void;
}

const SearchFilterDrawer: React.FC<Props> = (props: Props) => {
  const searchExtension = useRecoilValue(searchExtensionState);
  const [showingFilterDrawer, setShowingFilterDrawer] = useRecoilState(showingFilterDrawerState);
  const [filterValuesMap, setFilterValuesMap] = useRecoilState(filterValuesMapState);

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
  };

  const renderCheckbox = (option: FilterCheckbox) => {
    return (
      <Checkbox
        key={option.id}
        label={option.label}
        checked={getOptionValue(option) as boolean}
        onChange={(e) => setOptionValue(option.id, e.target.checked)}
      />
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
      <TextInput
        key={option.id}
        label={option.label}
        value={getOptionValue(option) as string}
        placeholder={option.placeholder}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setOptionValue(option.id, e.target.value)
        }
      />
    );
  };

  const renderSelect = (option: FilterSelect) => {
    return (
      <Select
        key={option.id}
        label={option.label}
        value={getOptionValue(option) as string}
        data={option.options}
        onChange={(value: string) => setOptionValue(option.id, value)}
      />
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
    return (
      <Title key={option.id} order={(option.order as TitleOrder) || 4}>
        {option.label}
      </Title>
    );
  };

  const renderSeparator = (option: FilterSeparator) => {
    return <Divider key={option.id} my="xs" />;
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

  return (
    <Drawer
      opened={showingFilterDrawer}
      onClose={() => {
        setShowingFilterDrawer(false);
        if (props.onClose !== undefined) props.onClose();
      }}
      position="right"
      padding="xl"
      title="Search Options"
      styles={(theme) => ({
        header: {
          paddingTop: theme.spacing.md,
        },
      })}
    >
      <ScrollArea style={{ height: 'calc(100vh - 84px)' }} type="hover" offsetScrollbars mr={-24}>
        <Stack spacing="xs" style={{ width: 272 }}>
          {renderControls()}
        </Stack>
      </ScrollArea>
    </Drawer>
  );
};

export default SearchFilterDrawer;
