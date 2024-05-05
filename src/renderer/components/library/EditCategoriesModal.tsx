import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ActionIcon, Group, Modal, Stack, TextInput, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconRefresh, IconRefreshOff, IconTrash } from '@tabler/icons';
import { categoryListState } from '@/renderer/state/libraryStates';
import library from '@/renderer/services/library';
import { Category } from '@/common/models/types';
import { libraryFilterCategoryState } from '@/renderer/state/settingStates';

type Props = {
  showing: boolean;
  close: () => void;
};

const EditCategoriesModal: React.FC<Props> = (props: Props) => {
  const [categoryList, setCategoryList] = useRecoilState(categoryListState);
  const [tempCategoryList, setTempCategoryList] = useState<Category[]>([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [libraryFilterCategory, setLibraryFilterCategory] = useRecoilState(
    libraryFilterCategoryState
  );
  const [promptRemoveCategoryIds, setPromptRemoveCategoryIds] = useState<string[]>([]);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPromptRemoveCategoryIds([]);
    if (props.showing) setTempCategoryList(categoryList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.showing]);

  const updateCategory = (
    categoryId: string,
    opts: { label?: string; refreshEnabled?: boolean }
  ) => {
    const categoryIdx = tempCategoryList.findIndex((cat) => cat.id === categoryId);
    const newTempCategoryList = [...tempCategoryList];
    newTempCategoryList[categoryIdx] = {
      ...newTempCategoryList[categoryIdx],
      label: opts.label === undefined ? tempCategoryList[categoryIdx].label : opts.label,
      refreshEnabled: opts.refreshEnabled,
    };
    setTempCategoryList(newTempCategoryList);
  };

  const promptRemoveCategory = (categoryId: string) => {
    setPromptRemoveCategoryIds([...promptRemoveCategoryIds, categoryId]);
  };

  const removeCategory = (categoryId: string) => {
    setTempCategoryList(tempCategoryList.filter((cat) => cat.id !== categoryId));
    if (libraryFilterCategory === categoryId) setLibraryFilterCategory('');
  };

  const addCategory = () => {
    setTempCategoryList([...tempCategoryList, { id: uuidv4(), label: newCategoryLabel }]);
    setNewCategoryLabel('');

    if (newCategoryInputRef.current) newCategoryInputRef.current.focus();
  };

  const handleClose = () => {
    categoryList.forEach((category) => {
      if (!tempCategoryList.includes(category)) library.removeCategory(category.id);
    });
    tempCategoryList.forEach((category) => library.upsertCategory(category));
    setCategoryList(library.fetchCategoryList());
    props.close();
  };

  return (
    <Modal opened={props.showing} title="Edit Categories" onClose={handleClose} size="xs">
      <Stack spacing={4} pr="sm">
        {tempCategoryList.map((category) => {
          return (
            <Group noWrap key={category.id} spacing={0}>
              <TextInput
                value={category.label}
                placeholder="Category name..."
                radius={0}
                mr={4}
                style={{ width: '100%' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateCategory(category.id, { label: e.target.value })
                }
              />

              <Tooltip.Floating
                label="Enable Refreshing"
                sx={(theme) => ({
                  backgroundColor: theme.colors.dark[8],
                  marginLeft: theme.spacing.xs,
                })}
              >
                <ActionIcon mx={4}>
                  {category.refreshEnabled || category.refreshEnabled === undefined ? (
                    <IconRefresh
                      size={18}
                      onClick={() => updateCategory(category.id, { refreshEnabled: false })}
                    />
                  ) : (
                    <IconRefreshOff
                      size={18}
                      onClick={() => updateCategory(category.id, { refreshEnabled: true })}
                    />
                  )}
                </ActionIcon>
              </Tooltip.Floating>

              <Tooltip.Floating
                label="Delete Category"
                sx={(theme) => ({
                  backgroundColor: theme.colors.dark[8],
                  marginLeft: theme.spacing.xs,
                })}
              >
                <ActionIcon color="red">
                  {promptRemoveCategoryIds.includes(category.id) ? (
                    <IconAlertCircle size={18} onClick={() => removeCategory(category.id)} />
                  ) : (
                    <IconTrash size={18} onClick={() => promptRemoveCategory(category.id)} />
                  )}
                </ActionIcon>
              </Tooltip.Floating>
            </Group>
          );
        })}

        <Group noWrap spacing="xs">
          <TextInput
            ref={newCategoryInputRef}
            data-autofocus
            value={newCategoryLabel}
            placeholder="Category name..."
            radius={0}
            style={{ width: '100%' }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewCategoryLabel(e.target.value)
            }
            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') addCategory();
            }}
          />
          <ActionIcon color="teal" mx={0} px={0}>
            <IconCheck size={18} onClick={() => addCategory()} />
          </ActionIcon>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditCategoriesModal;
