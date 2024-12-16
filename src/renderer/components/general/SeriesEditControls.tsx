import React from 'react';
import { Language, Series, SeriesStatus, Languages, LanguageKey } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import constants from '@/common/constants/constants.json';
import ExtensionImage from './ExtensionImage';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import blankCover from '@/renderer/img/blank_cover.png';
import { Label } from '@/ui/components/Label';
import { Input } from '@/ui/components/Input';
import { InputTags } from '@/ui/components/InputTags';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/Select';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/ui/components/Button';

type Props = {
  series: Series;
  setSeries: (series: Series) => void;
  editable: boolean;
};

export const SeriesEditControls: React.FC<Props> = (props: Props) => {
  const getCoverSrcUrl = () => {
    if (props.series.extensionId === FS_METADATA.id) {
      return props.series.remoteCoverUrl
        ? `atom://${encodeURIComponent(props.series.remoteCoverUrl)}`
        : blankCover;
    }
    return props.series.remoteCoverUrl;
  };

  return (
    <div className="flex space-x-4">
      <div className="max-w-40 md:max-w-44 lg:max-w-48 flex flex-col space-y-2">
        <ExtensionImage
          className="w-auto h-auto aspect-[70/100] object-cover rounded-sm"
          url={getCoverSrcUrl()}
          series={props.series}
          alt={props.series.title}
        />
        <div className="relative mt-1 mb-2">
          <ImageIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Button
            className="cursor-pointer pl-8 w-full truncate"
            variant="outline"
            title={props.series.remoteCoverUrl}
            disabled={!props.editable}
            onClick={() =>
              ipcRenderer
                .invoke(
                  ipcChannels.APP.SHOW_OPEN_DIALOG,
                  false,
                  [
                    {
                      name: 'Image',
                      extensions: constants.IMAGE_EXTENSIONS,
                    },
                  ],
                  'Select Series Cover',
                )
                .then((fileList: string) => {
                  if (fileList.length > 0) {
                    props.setSeries({
                      ...props.series,
                      remoteCoverUrl: fileList[0],
                    });
                  }
                })
            }
          >
            {props.series.remoteCoverUrl || 'Select cover'}
          </Button>
        </div>
      </div>
      <div className="flex flex-col space-y-3 w-full">
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Title</Label>
          <Input
            className="w-full"
            title={props.series.title}
            value={props.series.title}
            placeholder={'Title'}
            onChange={(e) =>
              props.setSeries({
                ...props.series,
                title: e.target.value,
              })
            }
            disabled={!props.editable}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Description</Label>
          <Input
            className="w-full"
            placeholder={'Description'}
            title={props.series.description}
            value={props.series.description}
            onChange={(e) =>
              props.setSeries({
                ...props.series,
                description: e.target.value,
              })
            }
            disabled={!props.editable}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Author(s)</Label>
          <InputTags
            placeholder="Authors"
            value={props.series.authors}
            onChange={(values) => props.setSeries({ ...props.series, authors: [...values] })}
            disabled={!props.editable}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Artist(s)</Label>
          <InputTags
            placeholder="Artists"
            value={props.series.artists}
            onChange={(values) => props.setSeries({ ...props.series, artists: [...values] })}
            disabled={!props.editable}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Tags</Label>
          <InputTags
            placeholder="Tags"
            value={props.series.tags}
            onChange={(values) => props.setSeries({ ...props.series, tags: [...values] })}
            disabled={!props.editable}
          />
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Language</Label>
          <Select
            value={props.series.originalLanguageKey}
            onValueChange={(value) =>
              props.setSeries({ ...props.series, originalLanguageKey: value as LanguageKey })
            }
            disabled={!props.editable}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Languages).map((language: Language) => (
                <SelectItem key={language.key} value={language.key}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2 items-center">
          <Label className="min-w-20 text-right">Status</Label>
          <Select
            value={props.series.status}
            onValueChange={(value) =>
              props.setSeries({ ...props.series, status: value as SeriesStatus })
            }
            disabled={!props.editable}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(SeriesStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
