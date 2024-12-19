import { Check, Filter } from 'lucide-react';
import { cn } from '@houdoku/ui/util';
import { Badge } from '@houdoku/ui/components/Badge';
import { Button } from '@houdoku/ui/components/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@houdoku/ui/components/Command';
import { Popover, PopoverContent, PopoverTrigger } from '@houdoku/ui/components/Popover';
import { Separator } from '@houdoku/ui/components/Separator';
import { Language, LanguageKey, Languages } from '@tiyo/common';
import { useRecoilState } from 'recoil';
import { chapterLanguagesState } from '@/renderer/state/settingStates';

const languageOptions = Object.values(Languages)
  .filter((language) => language.key !== LanguageKey.MULTI)
  .map((language: Language) => ({ value: language.key, label: language.name }));

export function ChapterTableLanguageFilter() {
  const [chapterLanguages, setChapterLanguages] = useRecoilState(chapterLanguagesState);

  const toggleLanguage = (languageKey: LanguageKey) => {
    if (chapterLanguages.includes(languageKey)) {
      setChapterLanguages(chapterLanguages.filter((lang) => lang !== languageKey));
    } else {
      setChapterLanguages([...chapterLanguages, languageKey]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" onContextMenu={() => setChapterLanguages([])}>
          <Filter />
          {'Language'}
          {chapterLanguages.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="default" className="rounded-sm px-1 font-normal lg:hidden">
                {chapterLanguages.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {chapterLanguages.length > 1 ? (
                  <Badge variant="default" className="rounded-sm px-1 font-normal">
                    {chapterLanguages.length} selected
                  </Badge>
                ) : (
                  languageOptions
                    .filter((option) => chapterLanguages.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="default"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={'Language'} />
          <CommandList className="-mr-3">
            <CommandEmpty>Language not found.</CommandEmpty>
            <CommandGroup>
              {languageOptions.map((option) => {
                const isSelected = chapterLanguages.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      toggleLanguage(option.value);
                    }}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {chapterLanguages.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setChapterLanguages([])}
                    className="justify-center text-center"
                  >
                    Clear filter
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
