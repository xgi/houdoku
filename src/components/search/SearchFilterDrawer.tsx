/* eslint-disable react/jsx-boolean-value */
import React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  Checkbox,
  Divider,
  Drawer,
  Select,
  Stack,
  TextInput,
  Title,
  TitleOrder,
} from '@mantine/core';
import {
  FilterCheckbox,
  FilterHeader,
  FilterInput,
  FilterOption,
  FilterOptionType,
  FilterSelect,
  FilterSeparator,
} from 'houdoku-extension-lib';
import {
  filterValuesMapState,
  searchExtensionState,
  showingFilterDrawerState,
} from '../../state/searchStates';

interface Props {
  filterOptions: FilterOption[];
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

  const renderHeader = (option: FilterHeader) => {
    return <Title order={(option.order as TitleOrder) || 4}>{option.label}</Title>;
  };

  const renderSeparator = (option: FilterSeparator) => {
    return <Divider my="sm" />;
  };

  const renderControls = () => {
    return props.filterOptions.map((option) => {
      switch (option.kind) {
        case FilterOptionType.Checkbox:
          return renderCheckbox(option as FilterCheckbox);
        case FilterOptionType.Input:
          return renderInput(option as FilterInput);
        case FilterOptionType.Select:
          return renderSelect(option as FilterSelect);
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
      onClose={() => setShowingFilterDrawer(false)}
      position="right"
      padding="xl"
      title="Search Options"
      styles={(theme) => ({
        header: {
          paddingTop: theme.spacing.md,
        },
      })}
    >
      <Stack spacing="xs">{renderControls()}</Stack>
    </Drawer>
  );
};

export default SearchFilterDrawer;
