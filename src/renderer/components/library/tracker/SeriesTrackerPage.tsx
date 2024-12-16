const { ipcRenderer } = require('electron');
import {
  TrackerSeries,
  TrackEntry,
  TrackerListEntry,
  TrackStatus,
  TrackerMetadata,
  TrackScoreFormat,
} from '@/common/models/types';
import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { SearchIcon, SquareArrowOutUpRight } from 'lucide-react';
import { Skeleton } from '@/ui/components/Skeleton';
import { Label } from '@/ui/components/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/Select';

const SCORE_FORMAT_OPTIONS: {
  [key in TrackScoreFormat]: number[];
} = {
  [TrackScoreFormat.POINT_10]: [...Array(11).keys()],
  [TrackScoreFormat.POINT_100]: [...Array(101).keys()],
  [TrackScoreFormat.POINT_10_DECIMAL]: [...Array(101).keys()],
  [TrackScoreFormat.POINT_10_DECIMAL_ONE_DIGIT]: ((sequence) => {
    sequence.splice(1, 9);
    return [...sequence];
  })([...Array(101).keys()].map((num) => num / 10)),
  [TrackScoreFormat.POINT_5]: [...Array(6).keys()],
  [TrackScoreFormat.POINT_3]: [...Array(4).keys()],
};

type Props = {
  series: Series;
  trackerMetadata: TrackerMetadata;
  trackEntry: TrackEntry | null;
  trackerListEntries: TrackerListEntry[];
  link: (trackerSeriesId: string) => void;
  updateTrackEntry: (entry: TrackEntry) => void;
};

export const SeriesTrackerPage: React.FC<Props> = (props: Props) => {
  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState(props.series.title);
  const [searchResultsList, setSearchResultsList] = useState<TrackerSeries[] | null>(null);

  const search = async () => {
    setSearching(true);
    const seriesList = await ipcRenderer
      .invoke(ipcChannels.TRACKER.SEARCH, props.trackerMetadata.id, searchText)
      .catch((e) => console.error(e));
    setSearchResultsList(seriesList.slice(0, 5));
    setSearching(false);
  };

  const renderSearchResults = () => {
    if (!searchResultsList || searchResultsList.length === 0) {
      return <span className="font-medium">No series found.</span>;
    }

    return (
      <div className="flex flex-col space-y-2">
        {searchResultsList.map((searchResult) => (
          <div key={searchResult.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2">
              <img src={searchResult.coverUrl} alt={searchResult.title} className="w-full" />
            </div>
            <div className="col-span-8">
              <p className="font-bold line-clamp-2">{searchResult.title}</p>
              <p className="line-clamp-2">{searchResult.description}</p>
            </div>
            <div className="col-span-2">
              <Button onClick={() => props.link(searchResult.id)}>Link</Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSearch = () => {
    return (
      <>
        <div className="relative mt-1 mb-2">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            autoFocus
            placeholder="Search for series..."
            defaultValue={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') search();
            }}
          />
        </div>

        {searching ? (
          <div className="flex flex-col space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-24" />
            ))}
          </div>
        ) : (
          renderSearchResults()
        )}
      </>
    );
  };

  const renderTrackEntry = () => {
    return (
      <div className="flex flex-col space-y-4">
        {props.trackerMetadata.hasCustomLists && (
          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <Select
              value={props.trackEntry!.listId}
              onValueChange={(value) => {
                if (value) {
                  props.updateTrackEntry({
                    ...props.trackEntry!,
                    listId: value,
                    listName: props.trackerListEntries.find((entry) => entry.id === value)?.name,
                    status: props.trackerListEntries.find((entry) => entry.id === value)?.status,
                  });
                }
              }}
            >
              <SelectTrigger className="max-w-52">
                <SelectValue placeholder={'placeholder'} />
              </SelectTrigger>
              <SelectContent side="bottom">
                {props.trackerListEntries.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!props.trackerMetadata.hasCustomLists && (
          <div className="flex flex-col space-y-2">
            <Label>Status</Label>
            <Select
              value={props.trackEntry!.status}
              onValueChange={(value) => {
                if (value) {
                  props.updateTrackEntry({
                    ...props.trackEntry!,
                    status: value as TrackStatus,
                  });
                }
              }}
            >
              <SelectTrigger className="max-w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom">
                {Object.values(TrackStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Label>Progress</Label>
          <Input
            className="max-w-32"
            type="number"
            value={props.trackEntry!.progress}
            min={1}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!Number.isNaN(value)) {
                props.updateTrackEntry({
                  ...props.trackEntry!,
                  progress: value,
                });
              }
            }}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Score</Label>
          <Select
            value={props.trackEntry!.score !== undefined ? `${props.trackEntry!.score}` : undefined}
            onValueChange={(value) => {
              if (value) {
                props.updateTrackEntry({
                  ...props.trackEntry!,
                  score: parseFloat(value),
                });
              }
            }}
          >
            <SelectTrigger className="max-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SCORE_FORMAT_OPTIONS[props.trackEntry!.scoreFormat || TrackScoreFormat.POINT_10].map(
                (value) => (
                  <SelectItem key={value} value={`${value}`}>
                    {value}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="flex space-x-2">
          <Button asChild>
            <a
              href={
                props.trackEntry!.url ||
                `${props.trackerMetadata.url}/manga/${props.trackEntry!.seriesId}`
              }
              target="_blank"
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
              View on {props.trackerMetadata.name}
            </a>
          </Button>
          <Button variant="destructive" onClick={() => props.link('')}>
            Unlink
          </Button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    setSearchText(props.series.title);
    search();
  }, [props.trackEntry]);

  return <div>{props.trackEntry ? renderTrackEntry() : renderSearch()}</div>;
};
