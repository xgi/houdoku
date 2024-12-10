const fs = require('fs');
import React from 'react';
const { ipcRenderer } = require('electron');
import { Languages, Series } from '@tiyo/common';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { Badge } from '@/ui/components/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/components/Card';

const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir);
}

type Props = {
  series: Series;
};

const SeriesDetailsInfoGrid: React.FC<Props> = (props: Props) => {
  const language = Languages[props.series.originalLanguageKey];
  const languageStr = language !== undefined && 'name' in language ? language.name : 'Unknown';

  const getCreatorsText = () => {
    const creators = Array.from(new Set([...props.series.authors, ...props.series.artists]));
    return creators.length > 0 ? creators.join('; ') : 'Unknown';
  };

  return (
    <div className="grid grid-cols-4 gap-2 py-3">
      <Card className="col-span-2">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Creator(s)</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1" title={getCreatorsText()}>
            {getCreatorsText()}
          </span>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1">{props.series.status || 'Unknown'}</span>
        </CardContent>
      </Card>
      <Card className="col-span-1">
        <CardHeader className="px-3 pb-0.5 pt-2">
          <CardTitle className="text-xs font-medium">Original Language</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <span className="font-bold text-sm line-clamp-1">{languageStr}</span>
        </CardContent>
      </Card>
      <div className="col-span-full space-x-1">
        {props.series.tags.map((tag: string) => (
          <Badge key={tag} className="capitalize" variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SeriesDetailsInfoGrid;
