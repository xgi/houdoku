import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  RowSelectionState,
  useReactTable,
} from '@tanstack/react-table';
const { ipcRenderer } = require('electron');
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/components/Table';
import { ChapterTablePagination } from './ChapterTablePagination';
import {
  chapterDownloadStatusesState,
  chapterListState,
  seriesState,
  sortedFilteredChapterListState,
} from '@/renderer/state/libraryStates';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Link, useNavigate } from 'react-router-dom';
import {
  chapterLanguagesState,
  chapterListChOrderState,
  chapterListVolOrderState,
  customDownloadsDirState,
} from '@/renderer/state/settingStates';
import { Chapter, Languages, Series } from '@tiyo/common';
import routes from '@/common/constants/routes.json';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Button } from '@/ui/components/Button';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  LanguagesIcon,
  Play,
  Settings2,
} from 'lucide-react';
import { ChapterTableLanguageFilter } from './ChapterTableLanguageFilter';
import { ChapterTableGroupFilter } from './ChapterTableGroupFilter';
import { markChapters } from '@/renderer/features/library/utils';
import { downloaderClient } from '@/renderer/services/downloader';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Checkbox } from '@/ui/components/Checkbox';
import { TableColumnSortOrder } from '@/common/models/types';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import { ContextMenu, ContextMenuTrigger } from '@/ui/components/ContextMenu';
import { ChapterTableContextMenu } from './ChapterTableContextMenu';
import { useEffect } from 'react';
import { currentTaskState } from '@/renderer/state/downloaderStates';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

const columnOrderMap = {
  [TableColumnSortOrder.Ascending]: <ArrowUp className="w-4 h-4" />,
  [TableColumnSortOrder.Descending]: <ArrowDown className="w-4 h-4" />,
  [TableColumnSortOrder.None]: <ChevronsUpDown className="w-4 h-4" />,
};

interface ChapterTableProps {
  series: Series;
}

export function ChapterTable(props: ChapterTableProps) {
  const navigate = useNavigate();
  const setSeries = useSetRecoilState(seriesState);
  const [chapterList, setChapterList] = useRecoilState(chapterListState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);
  const [chapterListVolOrder, setChapterListVolOrder] = useRecoilState(chapterListVolOrderState);
  const [chapterListChOrder, setChapterListChOrder] = useRecoilState(chapterListChOrderState);
  const [chapterDownloadStatuses, setChapterDownloadStatuses] = useRecoilState(
    chapterDownloadStatusesState,
  );
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const downloaderCurrentTask = useRecoilValue(currentTaskState);

  const columns: ColumnDef<Chapter>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex justify-start">
          <span className="w-5 h-5">
            <Checkbox
              checked={
                table.getIsAllRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
            />
          </span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex">
          <span className="w-5 h-5">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
          </span>
        </div>
      ),
      enableHiding: false,
    },
    {
      id: 'icons',
      header: () => <></>,
      cell: ({ row }) => {
        const isDownloaded =
          chapterDownloadStatuses[row.original.id!] || props.series.extensionId === FS_METADATA.id;

        const spacer = <div className="w-4" />;
        return (
          <span className="w-[30px] flex space-x-0.5">
            {row.original.read ? <Eye className="w-4 h-4" /> : spacer}
            {isDownloaded ? <FileCheck className="w-4 h-4" /> : spacer}
          </span>
        );
      },
      enableHiding: false,
    },
    {
      id: 'language',
      header: () => <LanguagesIcon className="w-4 h-4" />,
      cell: ({ row }) => {
        const language = Languages[row.original.languageKey];
        return (
          <div className="flex justify-start w-8">
            <div
              className={`inline-flex flag:${language?.flagCode} w-[1.125rem] h-[0.75rem]`}
              title={language?.name}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'title',
      header: () => <span>Title</span>,
      cell: ({ row }) => (
        <div className="flex">
          <span className="w-[100px] lg:w-[300px] xl:w-[400px] truncate">
            {row.getValue('title')}
          </span>
        </div>
      ),
    },
    {
      id: 'group',
      header: () => <span>Group</span>,
      cell: ({ row }) => (
        <div className="flex">
          <span className="w-[150px] truncate">{row.original.groupName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'volumeNumber',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent w-16"
          onClick={() => {
            switch (chapterListVolOrder) {
              case TableColumnSortOrder.Descending:
                setChapterListVolOrder(TableColumnSortOrder.Ascending);
                break;
              case TableColumnSortOrder.Ascending:
                setChapterListVolOrder(TableColumnSortOrder.None);
                break;
              default:
                setChapterListVolOrder(TableColumnSortOrder.Descending);
            }
          }}
        >
          <span>Vol</span>
          {columnOrderMap[chapterListVolOrder]}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex space-x-0">
          <span className="w-12 truncate">{row.getValue('volumeNumber')}</span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: 'chapterNumber',
      header: () => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 data-[state=open]:bg-accent w-12"
          onClick={() => {
            switch (chapterListChOrder) {
              case TableColumnSortOrder.Descending:
                setChapterListChOrder(TableColumnSortOrder.Ascending);
                break;
              case TableColumnSortOrder.Ascending:
                setChapterListChOrder(TableColumnSortOrder.None);
                break;
              default:
                setChapterListChOrder(TableColumnSortOrder.Descending);
            }
          }}
        >
          <span>Ch</span>
          {columnOrderMap[chapterListChOrder]}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="w-12 truncate">{row.getValue('chapterNumber')}</span>
        </div>
      ),
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: sortedFilteredChapterList,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    manualFiltering: true,
  });

  const updateDownloadStatuses = () => {
    ipcRenderer
      .invoke(
        ipcChannels.FILESYSTEM.GET_CHAPTERS_DOWNLOADED,
        props.series,
        chapterList,
        customDownloadsDir || defaultDownloadsDir,
      )
      .then((statuses) => setChapterDownloadStatuses(statuses))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (downloaderCurrentTask?.page === 2) updateDownloadStatuses();
  }, [downloaderCurrentTask]);

  useEffect(() => {
    if (chapterList.length > 0) updateDownloadStatuses();
  }, [chapterList]);

  const getSelectedChapters = (): Chapter[] => {
    return table.getSelectedRowModel().rows.map((row) => row.original) as Chapter[];
  };

  const getNextUnreadChapter = () => {
    return sortedFilteredChapterList
      .slice()
      .sort((a: Chapter, b: Chapter) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
      .find((chapter: Chapter) => !chapter.read);
  };

  const selectChapters = (chapters: Chapter[], keepCurrentSelection: boolean = true) => {
    const chapterIds = chapters.map((chapter) => chapter.id).filter((id) => id !== undefined);
    const rowsToSelect = table
      .getCoreRowModel()
      .rows.filter((row) => chapterIds.includes(row.original.id!));

    table.setRowSelection((old: RowSelectionState) => {
      const result = keepCurrentSelection ? { ...old } : {};
      rowsToSelect.forEach((row) => (result[row.id] = true));
      return result;
    });
  };

  const setSelectedRead = (read: boolean) => {
    markChapters(
      getSelectedChapters(),
      props.series,
      read,
      setChapterList,
      setSeries,
      chapterLanguages,
    );
  };

  const downloadSelected = () => {
    downloaderClient.add(
      getSelectedChapters().map((chapter) => ({
        chapter,
        series: props.series,
        downloadsDir: customDownloadsDir || defaultDownloadsDir,
      })),
    );
    downloaderClient.start();
  };

  return (
    <div className="space-y-2 pb-4">
      <div className="flex items-center justify-between">
        {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
          <div className="flex space-x-2">
            <Button variant="outline" className="ml-auto" onClick={() => setSelectedRead(true)}>
              <Eye className="w-4 h-4" />
              Mark selected read
            </Button>
            <Button variant="outline" className="ml-auto" onClick={() => setSelectedRead(false)}>
              <EyeOff className="w-4 h-4" />
              Mark selected unread
            </Button>
            {/* TODO add confirmation prompt */}
            <Button variant="outline" className="ml-auto" onClick={() => downloadSelected()}>
              <Download className="w-4 h-4" />
              Download selected
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <ChapterTableLanguageFilter />
            <ChapterTableGroupFilter
              uniqueGroupNames={Array.from(
                new Set(chapterList.map((chapter) => chapter.groupName)),
              )}
            />
          </div>
        )}

        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="w-4 h-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          {getNextUnreadChapter() && (
            <Link to={`${routes.READER}/${props.series.id}/${getNextUnreadChapter()?.id}`}>
              <Button variant="outline">
                <Play className="w-4 h-4" />
                Continue
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      className="cursor-pointer"
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() =>
                        navigate(`${routes.READER}/${props.series.id}/${row.original.id}`)
                      }
                    >
                      {row.getVisibleCells().map((cell) => {
                        const canClickThrough = ['select', 'icons'].includes(
                          cell.column.columnDef.id!,
                        );
                        return (
                          <TableCell
                            className={canClickThrough ? 'cursor-default' : ''}
                            key={cell.id}
                            onClick={(e) => canClickThrough && e.stopPropagation()}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  </ContextMenuTrigger>
                  <ChapterTableContextMenu
                    series={props.series}
                    chapter={row.original}
                    selectFunc={(chapters: Chapter[]) => selectChapters(chapters, true)}
                  />
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <ChapterTablePagination table={table} />
    </div>
  );
}
