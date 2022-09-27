import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { ActionIcon, Group, Modal, Stack, TextInput } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconTrash } from '@tabler/icons';
import { categoryListState, filterCategoryState } from '../../state/libraryStates';
import library from '../../services/library';
import { Category } from '../../models/types';

type Props = {
  showing: boolean;
  close: () => void;
};

const EditCategoriesModal: React.FC<Props> = (props: Props) => {
  const [categoryList, setCategoryList] = useRecoilState(categoryListState);
  const [tempCategoryList, setTempCategoryList] = useState<Category[]>([]);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [filterCategory, setFilterCategory] = useRecoilState(filterCategoryState);
  const [promptRemoveCategoryIds, setPromptRemoveCategoryIds] = useState<string[]>([]);
  const newCategoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPromptRemoveCategoryIds([]);
    if (props.showing) setTempCategoryList(categoryList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.showing]);

  const updateCategoryLabel = (categoryId: string, label: string) => {
    const categoryIdx = tempCategoryList.findIndex((cat) => cat.id === categoryId);
    const newTempCategoryList = [...tempCategoryList];
    newTempCategoryList[categoryIdx] = { ...newTempCategoryList[categoryIdx], label };
    setTempCategoryList(newTempCategoryList);
  };

  const promptRemoveCategory = (categoryId: string) => {
    setPromptRemoveCategoryIds([...promptRemoveCategoryIds, categoryId]);
  };

  const removeCategory = (categoryId: string) => {
    setTempCategoryList(tempCategoryList.filter((cat) => cat.id !== categoryId));
    if (filterCategory === categoryId) setFilterCategory('');
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
            <Group noWrap key={category.id} spacing="xs">
              <TextInput
                value={category.label}
                radius={0}
                style={{ width: '100%' }}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateCategoryLabel(category.id, e.target.value)
                }
              />
              <ActionIcon color="red" mx={0} px={0}>
                {promptRemoveCategoryIds.includes(category.id) ? (
                  <IconAlertCircle size={18} onClick={() => removeCategory(category.id)} />
                ) : (
                  <IconTrash size={18} onClick={() => promptRemoveCategory(category.id)} />
                )}
              </ActionIcon>
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
