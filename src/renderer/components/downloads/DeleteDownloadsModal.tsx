import React from 'react';
import { Group } from '@mantine/core';
import DefaultModal from '../general/DefaultModal';
import DefaultText from '../general/DefaultText';
import DefaultButton from '../general/DefaultButton';

type Props = {
  count: number;
  showing: boolean;
  deleteFunc: () => void;
  close: () => void;
};

const DeleteDownloadsModal: React.FC<Props> = (props: Props) => {
  const onDelete = () => {
    props.deleteFunc();
    props.close();
  };

  return (
    <DefaultModal opened={props.showing} title="Deleting downloaded chapters" onClose={props.close}>
      <DefaultText size="sm" mb="sm">
        Are you sure you want to delete {props.count} downloaded chapters?
      </DefaultText>
      <Group justify="flex-end" mt="sm">
        <DefaultButton onClick={props.close}>Cancel</DefaultButton>
        <DefaultButton oc="red" onClick={onDelete}>
          Delete
        </DefaultButton>
      </Group>
    </DefaultModal>
  );
};

export default DeleteDownloadsModal;
