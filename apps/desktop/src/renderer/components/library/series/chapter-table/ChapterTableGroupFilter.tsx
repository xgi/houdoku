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
import { useRecoilState } from 'recoil';
import { chapterFilterGroupNamesState } from '@/renderer/state/libraryStates';

type Props = {
  uniqueGroupNames: string[];
};

export function ChapterTableGroupFilter(props: Props) {
  const [filterGroupNames, setFilterGroupNames] = useRecoilState(chapterFilterGroupNamesState);

  const toggleGroupName = (groupName: string) => {
    if (filterGroupNames.includes(groupName)) {
      setFilterGroupNames(filterGroupNames.filter((name) => name !== groupName));
    } else {
      setFilterGroupNames([...filterGroupNames, groupName]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" onContextMenu={() => setFilterGroupNames([])}>
          <Filter />
          {'Group'}
          {filterGroupNames.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="default" className="rounded-sm px-1 font-normal lg:hidden">
                {filterGroupNames.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                <Badge variant="default" className="rounded-sm px-1 font-normal">
                  {filterGroupNames.length} selected
                </Badge>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={'Group'} />
          <CommandList className="-mr-3">
            <CommandEmpty>Group not found.</CommandEmpty>
            <CommandGroup>
              {props.uniqueGroupNames.map((groupName) => {
                const isSelected = filterGroupNames.includes(groupName);
                return (
                  <CommandItem
                    key={groupName}
                    onSelect={() => {
                      toggleGroupName(groupName);
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
                    <span>{groupName}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {filterGroupNames.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setFilterGroupNames([])}
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
