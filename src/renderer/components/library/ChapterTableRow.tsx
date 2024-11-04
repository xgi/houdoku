import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Chapter, Series, Languages } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { ActionIcon, Group, Table } from '@mantine/core';
import { IconDownload, IconEye, IconFileCheck } from '@tabler/icons';
import routes from '@/common/constants/routes.json';
import { sendProgressToTrackers } from '@/renderer/features/tracker/utils';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { markChapters } from '@/renderer/features/library/utils';
import flags from '@/renderer/img/flags.png';
import {
  chapterDownloadStatusesState,
  chapterListState,
  seriesState,
} from '@/renderer/state/libraryStates';
import {
  chapterLanguagesState,
  trackerAutoUpdateState,
  customDownloadsDirState,
} from '@/renderer/state/settingStates';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import DefaultText from '../general/DefaultText';
import DefaultCheckbox from '../general/DefaultCheckbox';
import DefaultActionIcon from '../general/DefaultActionIcon';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

type Props = {
  series: Series;
  chapter: Chapter;
  handleContextMenu: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void;
};

const ChapterTableRow: React.FC<Props> = (props: Props) => {
  const { series, chapter } = props;

  const setSeries = useSetRecoilState(seriesState);
  const setChapterList = useSetRecoilState(chapterListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const trackerAutoUpdate = useRecoilValue(trackerAutoUpdateState);
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const chapterDownloadStatuses = useRecoilValue(chapterDownloadStatusesState);
  const navigate = useNavigate();

  const handleToggleRead = () => {
    markChapters(
      [chapter],
      props.series,
      !chapter.read,
      setChapterList,
      setSeries,
      chapterLanguages,
    );
    if (!chapter.read && trackerAutoUpdate) {
      sendProgressToTrackers(chapter, props.series);
    }
  };

  const handleDownloadButton = (event: React.MouseEvent) => {
    event.stopPropagation();
    downloaderClient.add([
      {
        chapter,
        series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      } as DownloadTask,
    ]);
    downloaderClient.start();
  };

  const handleTableRowClicked = (rowPath: string) => {
    navigate(rowPath);
  };

  const renderDownloadIcon = () => {
    const isDownloaded =
      chapterDownloadStatuses[chapter.id!] || series.extensionId === FS_METADATA.id;

    return (
      <Group justify="flex-end" gap="xs" wrap="nowrap">
        {isDownloaded ? (
          <DefaultActionIcon disabled>
            <IconFileCheck size={16} />
          </DefaultActionIcon>
        ) : (
          <DefaultActionIcon onClick={handleDownloadButton}>
            <IconDownload size={16} />
          </DefaultActionIcon>
        )}
      </Group>
    );
  };

  return (
    <Table.Tr
      key={chapter.id}
      onContextMenu={props.handleContextMenu}
      onClick={() => handleTableRowClicked(`${routes.READER}/${series.id}/${chapter.id}`)}
    >
      <Table.Td>
        <DefaultCheckbox
          size="md"
          icon={({ ...others }) => <IconEye {...others} />}
          checked={chapter.read}
          onChange={handleToggleRead}
          onClick={(event) => event.stopPropagation()}
        />
      </Table.Td>
      <Table.Td>
        {Languages[chapter.languageKey] === undefined ? (
          <></>
        ) : (
          <div className="flag-container">
            <img
              src={flags}
              title={Languages[chapter.languageKey].name}
              alt={Languages[chapter.languageKey].name}
              className={`flag flag-${Languages[chapter.languageKey].flagCode}`}
            />
          </div>
        )}
      </Table.Td>
      <Table.Td>
        <DefaultText lineClamp={1} size="sm">
          {chapter.title}
        </DefaultText>
      </Table.Td>
      <Table.Td>
        <DefaultText lineClamp={1} size="sm">
          {chapter.groupName}
        </DefaultText>
      </Table.Td>
      <Table.Td>
        <DefaultText lineClamp={1} size="sm" ta="center">
          {chapter.volumeNumber}
        </DefaultText>
      </Table.Td>
      <Table.Td>
        <DefaultText lineClamp={1} size="sm" ta="center">
          {chapter.chapterNumber}
        </DefaultText>
      </Table.Td>
      <Table.Td>{renderDownloadIcon()}</Table.Td>
    </Table.Tr>
  );
};

export default ChapterTableRow;
