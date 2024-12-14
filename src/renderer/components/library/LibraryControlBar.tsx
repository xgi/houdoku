import React from 'react';
import { Series, SeriesStatus } from '@tiyo/common';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { reloadSeriesList } from '@/renderer/features/library/utils';
import { LibrarySort, LibraryView, ProgressFilter } from '@/common/models/types';
import {
  filterState,
  reloadingSeriesListState,
  seriesListState,
} from '@/renderer/state/libraryStates';
import {
  libraryFilterStatusState,
  libraryFilterProgressState,
  libraryColumnsState,
  libraryViewState,
  librarySortState,
  chapterLanguagesState,
} from '@/renderer/state/settingStates';
import { Button } from '@/ui/components/Button';
import {
  ArrowDown,
  ArrowUp,
  CaseUpper,
  Check,
  Columns2,
  Hash,
  ImageIcon,
  LayoutGrid,
  Loader2,
  PanelBottom,
  Rows2,
  Search,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import { Input } from '@/ui/components/Input';

const SORT_ICONS = {
  [LibrarySort.TitleAsc]: <ArrowUp size={14} />,
  [LibrarySort.TitleDesc]: <ArrowDown size={14} />,
  [LibrarySort.UnreadAsc]: <ArrowUp size={14} />,
  [LibrarySort.UnreadDesc]: <ArrowDown size={14} />,
};

type Props = {
  getFilteredList: () => Series[];
};

const LibraryControlBar: React.FC<Props> = (props: Props) => {
  const setSeriesList = useSetRecoilState(seriesListState);
  const [reloadingSeriesList, setReloadingSeriesList] = useRecoilState(reloadingSeriesListState);
  const setFilter = useSetRecoilState(filterState);
  const [libraryFilterStatus, setLibraryFilterStatus] = useRecoilState(libraryFilterStatusState);
  const [libraryFilterProgress, setLibraryFilterProgress] = useRecoilState(
    libraryFilterProgressState,
  );
  const [libraryColumns, setLibraryColumns] = useRecoilState(libraryColumnsState);
  const [libraryView, setLibraryView] = useRecoilState(libraryViewState);
  const [librarySort, setLibrarySort] = useRecoilState(librarySortState);
  const chapterLanguages = useRecoilValue(chapterLanguagesState);

  const refreshHandler = () => {
    if (!reloadingSeriesList) {
      reloadSeriesList(
        props.getFilteredList(),
        setSeriesList,
        setReloadingSeriesList,
        chapterLanguages,
      );
    }
  };

  return (
    <div className="flex justify-between flex-nowrap py-3">
      <div className="flex gap-3 flex-nowrap">
        <Button disabled={reloadingSeriesList} onClick={refreshHandler}>
          {reloadingSeriesList && <Loader2 className="animate-spin" />}
          {reloadingSeriesList ? 'Refreshing...' : 'Refresh'}{' '}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Layout</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>View</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibraryView(LibraryView.GridCompact);
                }}
              >
                <LayoutGrid />
                Compact grid
                {libraryView === LibraryView.GridCompact && (
                  <DropdownMenuShortcut>
                    <Check className="w-4 h-4" />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibraryView(LibraryView.GridComfortable);
                }}
              >
                <PanelBottom />
                Comfortable grid
                {libraryView === LibraryView.GridComfortable && (
                  <DropdownMenuShortcut>
                    <Check className="w-4 h-4" />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibraryView(LibraryView.GridCoversOnly);
                }}
              >
                <ImageIcon />
                Cover grid
                {libraryView === LibraryView.GridCoversOnly && (
                  <DropdownMenuShortcut>
                    <Check className="w-4 h-4" />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibraryView(LibraryView.List);
                }}
              >
                <Rows2 />
                List
                {libraryView === LibraryView.List && (
                  <DropdownMenuShortcut>
                    <Check className="w-4 h-4" />
                  </DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Sort</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibrarySort(
                    librarySort === LibrarySort.TitleAsc
                      ? LibrarySort.TitleDesc
                      : LibrarySort.TitleAsc,
                  );
                }}
              >
                <CaseUpper />
                Title
                {[LibrarySort.TitleAsc, LibrarySort.TitleDesc].includes(librarySort) && (
                  <DropdownMenuShortcut>{SORT_ICONS[librarySort]}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setLibrarySort(
                    librarySort === LibrarySort.UnreadAsc
                      ? LibrarySort.UnreadDesc
                      : LibrarySort.UnreadAsc,
                  );
                }}
              >
                <Hash />
                Unread
                {[LibrarySort.UnreadAsc, LibrarySort.UnreadDesc].includes(librarySort) && (
                  <DropdownMenuShortcut>{SORT_ICONS[librarySort]}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setLibraryColumns(
                  {
                    2: 4,
                    4: 6,
                    6: 8,
                    8: 2,
                  }[libraryColumns as 2 | 4 | 6 | 8],
                );
              }}
            >
              <Columns2 />
              Columns
              <DropdownMenuShortcut>{libraryColumns}</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Progress</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={libraryFilterProgress}
              onValueChange={(value) => setLibraryFilterProgress(value as ProgressFilter)}
            >
              {Object.values(ProgressFilter).map((value) => (
                <DropdownMenuRadioItem
                  key={value}
                  value={value}
                  onSelect={(e) => e.preventDefault()}
                >
                  {value}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={libraryFilterStatus || 'Any'}
              onValueChange={(value) =>
                setLibraryFilterStatus((value === 'Any' ? null : value) as SeriesStatus)
              }
            >
              {['Any', ...Object.values(SeriesStatus)].map((status) => (
                <DropdownMenuRadioItem
                  key={status}
                  value={status}
                  onSelect={(e) => e.preventDefault()}
                >
                  {status}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-3 flex-nowrap justify-end">
        <form onSubmit={() => false}>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="pl-8"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilter(e.target.value)}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default LibraryControlBar;
