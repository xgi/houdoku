import React from 'react';
import { useRecoilState } from 'recoil';
import { OffsetPages, PageStyle, ReadingDirection } from '@/common/models/types';
import {
  fitContainToHeightState,
  fitContainToWidthState,
  fitStretchState,
  maxPageWidthState,
  offsetPagesState,
  optimizeContrastState,
  pageGapState,
  pageStyleState,
  pageWidthMetricState,
  readingDirectionState,
} from '@/renderer/state/settingStates';
import { Checkbox } from '@houdoku/ui/components/Checkbox';
import { Label } from '@houdoku/ui/components/Label';
import { Tabs, TabsList, TabsTrigger } from '@houdoku/ui/components/Tabs';
import {
  ArrowBigLeftIcon,
  ArrowBigRightIcon,
  BookOpenIcon,
  GalleryVerticalIcon,
  StickyNoteIcon,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@houdoku/ui/components/RadioGroup';
import { Slider } from '@houdoku/ui/components/Slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@houdoku/ui/components/Select';

export const SettingsReader: React.FC = () => {
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [readingDirection, setReadingDirection] = useRecoilState(readingDirectionState);
  const [pageGap, setPageGap] = useRecoilState(pageGapState);
  const [offsetPages, setOffsetPages] = useRecoilState(offsetPagesState);
  const [maxPageWidth, setMaxPageWidth] = useRecoilState(maxPageWidthState);
  const [pageWidthMetric, setPageWidthMetric] = useRecoilState(pageWidthMetricState);
  const [optimizeContrast, setOptimizeContrast] = useRecoilState(optimizeContrastState);

  return (
    <>
      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium">Page Style</span>
        <Tabs value={pageStyle} onValueChange={(value) => setPageStyle(value as PageStyle)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={PageStyle.Single} className="flex space-x-1.5">
              <StickyNoteIcon className="w-4 h-4" /> <span>Single Page</span>
            </TabsTrigger>
            <TabsTrigger value={PageStyle.Double} className="flex space-x-1.5">
              <BookOpenIcon className="w-4 h-4" />
              <span>Double Page</span>
            </TabsTrigger>
            <TabsTrigger value={PageStyle.LongStrip} className="flex space-x-1.5">
              <GalleryVerticalIcon className="w-4 h-4" />
              <span>Long Strip</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxReaderPageGap"
            checked={pageGap}
            onCheckedChange={(checked) => setPageGap(checked === true)}
            disabled={pageStyle === PageStyle.Single}
          />
          <Label htmlFor="checkboxReaderPageGap" className="font-normal">
            Spacing between pages
          </Label>
        </div>
        <RadioGroup
          className="grid-flow-col ml-1"
          value={offsetPages}
          onValueChange={(value) => setOffsetPages(value as OffsetPages)}
          disabled={pageStyle !== PageStyle.Double}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={OffsetPages.First} id="radioOffsetFirst" />
            <Label htmlFor="radioOffsetFirst" className="font-normal">
              Offset first page
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={OffsetPages.All} id="radioOffsetAll" />
            <Label htmlFor="radioOffsetAll" className="font-normal">
              Offset all pages
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={OffsetPages.None} id="radioOffsetNone" />
            <Label htmlFor="radioOffsetNone" className="font-normal">
              No offset
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium">Reading Direction</span>
        <Tabs
          value={readingDirection}
          onValueChange={(value) => setReadingDirection(value as ReadingDirection)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={ReadingDirection.LeftToRight} className="flex space-x-1.5">
              <ArrowBigRightIcon className="w-4 h-4" /> <span>Left-to-Right</span>
            </TabsTrigger>
            <TabsTrigger value={ReadingDirection.RightToLeft} className="flex space-x-1.5">
              <ArrowBigLeftIcon className="w-4 h-4" />
              <span>Right-to-Left</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col space-y-2">
        <span className="text-sm font-medium">Image Sizing</span>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxContainToWidth"
            checked={fitContainToWidth}
            onCheckedChange={(checked) => setFitContainToWidth(checked === true)}
          />
          <Label htmlFor="checkboxContainToWidth" className="font-normal">
            Contain to width
          </Label>
        </div>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxContainToHeight"
            checked={fitContainToHeight}
            onCheckedChange={(checked) => setFitContainToHeight(checked === true)}
          />
          <Label htmlFor="checkboxContainToHeight" className="font-normal">
            Contain to height
          </Label>
        </div>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxStretch"
            checked={fitStretch}
            onCheckedChange={(checked) => setFitStretch(checked === true)}
            disabled={!(fitContainToHeight || fitContainToWidth)}
          />
          <Label htmlFor="checkboxStretch" className="font-normal">
            Stretch small pages
          </Label>
        </div>

        <Label className="ml-0.5 pt-1">Max page width</Label>
        <div className="flex space-x-2 items-center !mt-0 !mb-0">
          <Slider
            min={10}
            max={pageWidthMetric === '%' ? 100 : window.innerWidth}
            step={10}
            value={[maxPageWidth]}
            onValueChange={(value) => setMaxPageWidth(value[0])}
          />
          <span className="w-16 text-right">{maxPageWidth}</span>
          <Select
            value={pageWidthMetric}
            onValueChange={(value) => {
              setPageWidthMetric(value);
            }}
          >
            <SelectTrigger className="max-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="%">percent</SelectItem>
                <SelectItem value="px">pixels</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col space-y-2 !mt-0">
        <span className="text-sm font-medium">Rendering</span>
        <div className="flex items-center space-x-2 ml-1">
          <Checkbox
            id="checkboxOptimizeContrast"
            checked={optimizeContrast}
            onCheckedChange={(checked) => setOptimizeContrast(checked === true)}
          />
          <Label htmlFor="checkboxOptimizeContrast" className="font-normal">
            Optimize image contrast
          </Label>
        </div>
      </div>
    </>
  );
};
