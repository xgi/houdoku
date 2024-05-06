import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ActionIcon, Group, Modal, Stack, TextInput, Tooltip } from '@mantine/core';
import { IconAlertCircle, IconPlus, IconRefresh, IconRefreshOff, IconTrash } from '@tabler/icons';
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
    libraryFilterCategoryState,
  );
  const [promptRemoveCategoryIds, setPromptRemoveCategoryIds] = useState<string[]>([]);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPromptRemoveCategoryIds([]);
    if (props.showing) setTempCategoryList(categoryList);
  }, [props.showing]);

  const updateCategory = (
    categoryId: string,
    opts: { label?: string; refreshEnabled?: boolean },
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
      <Stack gap={4} pr="sm">
        {tempCategoryList.map((category) => {
          return (
            <Group wrap="nowrap" key={category.id} gap={0}>
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

              <Tooltip.Floating label="Allow Refreshing" ml="xs">
                {category.refreshEnabled || category.refreshEnabled === undefined ? (
                  <ActionIcon mx={4}>
                    <IconRefresh
                      size={18}
                      onClick={() => updateCategory(category.id, { refreshEnabled: false })}
                    />
                  </ActionIcon>
                ) : (
                  <ActionIcon mx={4} bg="gray.8">
                    <IconRefreshOff
                      size={18}
                      onClick={() => updateCategory(category.id, { refreshEnabled: true })}
                    />
                  </ActionIcon>
                )}
              </Tooltip.Floating>

              <Tooltip.Floating label="Delete Category" ml="xs">
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

        <Group wrap="nowrap" gap="xs">
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
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') addCategory();
            }}
          />
          <Tooltip.Floating label="Create Category" ml="xs">
            <ActionIcon color="teal" mx={0} px={0}>
              <IconPlus size={18} onClick={() => addCategory()} />
            </ActionIcon>
          </Tooltip.Floating>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditCategoriesModal;
