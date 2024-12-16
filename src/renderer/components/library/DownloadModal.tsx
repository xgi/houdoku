import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilValue } from 'recoil';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';
import { customDownloadsDirState } from '@/renderer/state/settingStates';
import { sortedFilteredChapterListState } from '@/renderer/state/libraryStates';
import { downloadAll, downloadNextX } from '@/renderer/features/library/chapterDownloadUtils';
import { queueState } from '@/renderer/state/downloaderStates';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import { RadioGroup, RadioGroupItem } from '@/ui/components/RadioGroup';
import { Label } from '@/ui/components/Label';
import { Input } from '@/ui/components/Input';

const defaultDownloadsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR);

enum DownloadAction {
  NextX = 'NextX',
  Range = 'Range',
  Unread = 'Unread',
  All = 'All',
}

type Props = {
  series: Series;
  showing: boolean;
  setShowing: (showing: boolean) => void;
};

const DownloadModal: React.FC<Props> = (props: Props) => {
  const customDownloadsDir = useRecoilValue(customDownloadsDirState);
  const sortedFilteredChapterList = useRecoilValue(sortedFilteredChapterListState);
  const downloadQueue = useRecoilValue(queueState);
  const [downloadNextAmount, setDownloadNextAmount] = useState(5);
  const [downloadRangeStart, setDownloadRangeStart] = useState(1);
  const [downloadRangeEnd, setDownloadRangeEnd] = useState(1);
  const [downloadAction, setDownloadAction] = useState<DownloadAction>(DownloadAction.NextX);

  useEffect(() => {
    if (sortedFilteredChapterList.length === 0) {
      props.setShowing(false);
      return;
    }

    const lowestUnreadChapter = sortedFilteredChapterList
      .toReversed()
      .find((c) => c.chapterNumber && !c.read);
    setDownloadRangeStart(
      lowestUnreadChapter
        ? parseFloat(lowestUnreadChapter.chapterNumber)
        : parseFloat(sortedFilteredChapterList.toReversed()[0].chapterNumber),
    );
    setDownloadRangeEnd(parseFloat(sortedFilteredChapterList[0].chapterNumber));
  }, [sortedFilteredChapterList]);

  const downloadFunc = () => {
    if (downloadAction === DownloadAction.NextX) {
      downloadNextX(
        sortedFilteredChapterList,
        props.series,
        customDownloadsDir || defaultDownloadsDir,
        downloadQueue,
        downloadNextAmount,
      );
    } else if (downloadAction === DownloadAction.All) {
      downloadAll(
        sortedFilteredChapterList,
        props.series,
        customDownloadsDir || defaultDownloadsDir,
        false,
      );
    } else if (downloadAction === DownloadAction.Unread) {
      downloadAll(
        sortedFilteredChapterList,
        props.series,
        customDownloadsDir || defaultDownloadsDir,
        true,
      );
    } else if (downloadAction === DownloadAction.Range) {
      const chaptersInRange = sortedFilteredChapterList.filter((c) => {
        const parsedNum = parseFloat(c.chapterNumber);
        if (isNaN(parsedNum)) return false;
        return parsedNum >= downloadRangeStart && parsedNum <= downloadRangeEnd;
      });
      downloadAll(chaptersInRange, props.series, customDownloadsDir || defaultDownloadsDir);
    }

    props.setShowing(false);
  };

  const renderDownloadNextX = () => {
    return (
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={DownloadAction.NextX} id="radioDownloadNextX" />
        <Label htmlFor="radioDownloadNextX">Download next</Label>
        <Input
          className="max-w-20 w-20"
          type="number"
          value={downloadNextAmount}
          min={0}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!Number.isNaN(value)) {
              setDownloadNextAmount(value);
            } else {
              setDownloadNextAmount(0);
            }
          }}
          disabled={downloadAction !== DownloadAction.NextX}
        />
        <Label htmlFor="radioDownloadNextX">chapters</Label>
      </div>
    );
  };

  const renderDownloadRange = () => {
    return (
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={DownloadAction.Range} id="radioDownloadRange" />
        <Label htmlFor="radioDownloadRange">Download chapters</Label>
        <Input
          className="max-w-20 w-20"
          type="number"
          value={downloadRangeStart}
          min={0}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!Number.isNaN(value)) {
              setDownloadRangeStart(value);
            } else {
              setDownloadRangeStart(0);
            }
          }}
          disabled={downloadAction !== DownloadAction.Range}
        />
        <Label htmlFor="radioDownloadRange">through</Label>
        <Input
          className="max-w-20 w-20"
          type="number"
          value={downloadRangeEnd}
          min={0}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!Number.isNaN(value)) {
              setDownloadRangeEnd(value);
            } else {
              setDownloadRangeEnd(0);
            }
          }}
          disabled={downloadAction !== DownloadAction.Range}
        />
      </div>
    );
  };

  const renderDownloadUnread = () => {
    return (
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={DownloadAction.Unread} id="radioDownloadUnread" />
        <Label htmlFor="radioDownloadUnread">Download unread chapters</Label>
      </div>
    );
  };

  const renderDownloadAll = () => {
    return (
      <div className="flex items-center space-x-2">
        <RadioGroupItem value={DownloadAction.All} id="radioDownloadAll" />
        <Label htmlFor="radioDownloadAll">Download all chapters</Label>
      </div>
    );
  };

  return (
    <Dialog open={props.showing} onOpenChange={props.setShowing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download chapters</DialogTitle>
        </DialogHeader>
        <RadioGroup
          value={downloadAction}
          onValueChange={(value) => setDownloadAction(value as DownloadAction)}
        >
          {renderDownloadNextX()}
          {renderDownloadRange()}
          {renderDownloadUnread()}
          {renderDownloadAll()}
        </RadioGroup>
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.setShowing(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={downloadFunc}>
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DownloadModal;
