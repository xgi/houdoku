import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/ui/components/Sidebar';
import {
  BookOpenIcon,
  Check,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  GalleryVerticalIcon,
  Settings2Icon,
  StickyNoteIcon,
  XIcon,
} from 'lucide-react';
import {
  seriesState,
  pageNumberState,
  showingSettingsModalState,
  lastPageNumberState,
  pageGroupListState,
  chapterState,
  relevantChapterListState,
  languageChapterListState,
} from '@/renderer/state/readerStates';
import {
  pageStyleState,
  fitContainToWidthState,
  fitContainToHeightState,
  fitStretchState,
  readingDirectionState,
  pageGapState,
} from '@/renderer/state/settingStates';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Button } from '@/ui/components/Button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/Select';
import { Chapter, Languages } from '@tiyo/common';
import { PageStyle, ReadingDirection } from '@/common/models/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/components/Collapsible';
import { RadioGroup, RadioGroupItem } from '@/ui/components/RadioGroup';
import { Label } from '@/ui/components/Label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';

type Props = {
  changePage: (left: boolean, toBound?: boolean) => void;
  setChapter: (id: string, page?: number) => void;
  changeChapter: (direction: 'left' | 'right' | 'next' | 'previous') => void;
  getAdjacentChapterId: (previous: boolean) => string | null;
  exitPage: () => void;
};

export const ReaderSidebar: React.FC<Props> = (props: Props) => {
  const readerSeries = useRecoilValue(seriesState);
  const [pageNumber, setPageNumber] = useRecoilState(pageNumberState);
  const setShowingSettingsModal = useSetRecoilState(showingSettingsModalState);
  const lastPageNumber = useRecoilValue(lastPageNumberState);
  const pageGroupList = useRecoilValue(pageGroupListState);
  const chapter = useRecoilValue(chapterState);
  const relevantChapterList = useRecoilValue(relevantChapterListState);
  const languageChapterList = useRecoilValue(languageChapterListState);
  const [pageStyle, setPageStyle] = useRecoilState(pageStyleState);
  const [pageGap, setPageGap] = useRecoilState(pageGapState);
  const [fitContainToWidth, setFitContainToWidth] = useRecoilState(fitContainToWidthState);
  const [fitContainToHeight, setFitContainToHeight] = useRecoilState(fitContainToHeightState);
  const [fitStretch, setFitStretch] = useRecoilState(fitStretchState);
  const readingDirection = useRecoilValue(readingDirectionState);

  const getCurrentPageNumText = () => {
    let text = `${pageNumber}`;
    if (pageStyle === PageStyle.Double) {
      const curGroup = pageGroupList.find((group) => group.includes(pageNumber));
      if (curGroup && curGroup.length > 1) {
        text = `${curGroup[0]}-${curGroup[1]}`;
      }
    }
    return `${text} / ${lastPageNumber}`.replace('Infinity', '??');
  };

  if (!readerSeries || !chapter) {
    return <></>;
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenuItem>
          <SidebarMenuButton
            className="max-w-full flex space-x-1 px-1 py-6"
            onClick={() => props.exitPage()}
          >
            <XIcon className="opacity-50" />
            <h3 className="truncate font-semibold text-wrap line-clamp-2">{readerSeries.title}</h3>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex w-full space-x-1">
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1.5"
                  disabled={
                    (readingDirection === ReadingDirection.LeftToRight &&
                      props.getAdjacentChapterId(true) === null) ||
                    (readingDirection === ReadingDirection.RightToLeft &&
                      props.getAdjacentChapterId(false) === null)
                  }
                  onClick={() => props.changeChapter('left')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Select value="placeholder">
                  <SelectTrigger>
                    <SelectValue>
                      {chapter && chapter.chapterNumber
                        ? `Chapter ${chapter.chapterNumber}`
                        : 'Unknown Chapter'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {relevantChapterList
                        .filter((c) => c.id !== undefined)
                        .map((relevantChapter: Chapter) => (
                          <SelectItem
                            key={relevantChapter.id}
                            value={relevantChapter.id!}
                            onClick={() => props.setChapter(relevantChapter.id!)}
                          >
                            Chapter {relevantChapter.chapterNumber}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1.5"
                  disabled={
                    (readingDirection === ReadingDirection.LeftToRight &&
                      props.getAdjacentChapterId(false) === null) ||
                    (readingDirection === ReadingDirection.RightToLeft &&
                      props.getAdjacentChapterId(true) === null)
                  }
                  onClick={() => props.changeChapter('right')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex w-full space-x-1">
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1"
                  disabled={
                    (readingDirection === ReadingDirection.LeftToRight && pageNumber <= 1) ||
                    (readingDirection === ReadingDirection.RightToLeft &&
                      pageNumber >= lastPageNumber)
                  }
                  onClick={() => props.changePage(true, true)}
                >
                  <ChevronFirst className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1"
                  disabled={
                    (readingDirection === ReadingDirection.RightToLeft &&
                      pageNumber === lastPageNumber &&
                      props.getAdjacentChapterId(false) === null) ||
                    (readingDirection === ReadingDirection.LeftToRight &&
                      pageNumber <= 1 &&
                      props.getAdjacentChapterId(true) === null)
                  }
                  onClick={() => props.changePage(true)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Select value="placeholder">
                  <SelectTrigger>
                    <SelectValue>{getCurrentPageNumText()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Array.from({ length: lastPageNumber }, (_v, k) => k + 1).map((i: number) => (
                        <SelectItem key={i} value={`${i}`} onClick={() => setPageNumber(i)}>
                          Page {i}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1"
                  disabled={
                    (readingDirection === ReadingDirection.LeftToRight &&
                      pageNumber === lastPageNumber &&
                      props.getAdjacentChapterId(false) === null) ||
                    (readingDirection === ReadingDirection.RightToLeft &&
                      pageNumber <= 1 &&
                      props.getAdjacentChapterId(true) === null)
                  }
                  onClick={() => props.changePage(false)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="flex justify-center bg-transparent !px-1"
                  disabled={
                    (readingDirection === ReadingDirection.LeftToRight &&
                      pageNumber >= lastPageNumber) ||
                    (readingDirection === ReadingDirection.RightToLeft && pageNumber <= 1)
                  }
                  onClick={() => props.changePage(false, true)}
                >
                  <ChevronLast className="w-4 h-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="py-2 border-y border-sidebar-border">
          <Collapsible className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                Page Style{' '}
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <RadioGroup
                      className="grid grid-cols-3 gap-1 py-2"
                      value={pageStyle}
                      onValueChange={(v) => setPageStyle(v as PageStyle)}
                    >
                      {[
                        {
                          icon: StickyNoteIcon,
                          text: 'Single',
                          value: PageStyle.Single,
                        },
                        {
                          icon: BookOpenIcon,
                          text: 'Double',
                          value: PageStyle.Double,
                        },
                        {
                          icon: GalleryVerticalIcon,
                          text: 'Vertical',
                          value: PageStyle.LongStrip,
                        },
                      ].map((item) => {
                        const id = `pageStyle-${item.value}`;
                        return (
                          <div key={item.value}>
                            <RadioGroupItem value={item.value} id={id} className="peer sr-only" />
                            <Label
                              htmlFor={id}
                              className="flex flex-col items-center justify-between rounded-md border border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                              <item.icon className="mb-3 h-6 w-6" />
                              {item.text}
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setPageGap(!pageGap)}
                      disabled={pageStyle === PageStyle.Single}
                    >
                      <div
                        data-active={pageGap}
                        className="group/item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-foreground data-[active=true]:bg-sidebar-foreground"
                      >
                        <Check className="hidden group-data-[active=true]/item:block text-background" />
                      </div>
                      Spacing between pages
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup className="pt-0 pb-2 border-b border-sidebar-border">
          <Collapsible className="group/collapsible">
            <SidebarGroupLabel
              asChild
              className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                Page Fit{' '}
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setFitContainToWidth(!fitContainToWidth)}>
                      <div
                        data-active={fitContainToWidth}
                        className="group/item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-foreground data-[active=true]:bg-sidebar-foreground"
                      >
                        <Check className="hidden group-data-[active=true]/item:block text-background" />
                      </div>
                      Contain to width
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setFitContainToHeight(!fitContainToHeight)}>
                      <div
                        data-active={fitContainToHeight}
                        className="group/item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-foreground data-[active=true]:bg-sidebar-foreground"
                      >
                        <Check className="hidden group-data-[active=true]/item:block text-background" />
                      </div>
                      Contain to height
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setFitStretch(!fitStretch)}
                      disabled={!(fitContainToHeight || fitContainToWidth)}
                    >
                      <div
                        data-active={fitStretch}
                        className="group/item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-foreground data-[active=true]:bg-sidebar-foreground"
                      >
                        <Check className="hidden group-data-[active=true]/item:block text-background" />
                      </div>
                      Stretch small pages
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
        <SidebarGroup className="pt-0 pb-2 border-b border-sidebar-border">
          <SidebarGroupLabel
            asChild
            className="w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <SidebarMenuButton onClick={() => setShowingSettingsModal(true)}>
              Settings <Settings2Icon className="ml-auto" />
            </SidebarMenuButton>
          </SidebarGroupLabel>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex w-full space-x-2 items-center">
                    <div className="flex-1 text-left text-sm leading-tight overflow-hidden">
                      <span className="truncate font-semibold">
                        {chapter.volumeNumber && `Vol. ${chapter.volumeNumber} · `}
                        Ch. {chapter.chapterNumber}
                      </span>
                      <div className="flex space-x-1 items-center">
                        <div
                          className={`flag:${Languages[chapter.languageKey]?.flagCode} w-[1.125rem] h-[0.75rem]`}
                          title={Languages[chapter.languageKey]?.name}
                        />
                        <span className="truncate text-xs">
                          {Languages[chapter.languageKey]?.name}
                          {chapter.groupName && ` by ${chapter.groupName}`}
                        </span>
                      </div>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                {languageChapterList.map((languageChapter: Chapter) => (
                  <DropdownMenuItem
                    key={languageChapter.id}
                    onClick={() => {
                      if (languageChapter.id) props.setChapter(languageChapter.id, pageNumber);
                    }}
                  >
                    {Languages[languageChapter.languageKey] !== undefined && (
                      <>
                        <div
                          className={`flag:${Languages[languageChapter.languageKey]?.flagCode} w-[1.125rem] h-[0.75rem]`}
                          title={Languages[languageChapter.languageKey]?.name}
                        />
                        {`${Languages[languageChapter.languageKey].name} by ${languageChapter.groupName}`}
                      </>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
