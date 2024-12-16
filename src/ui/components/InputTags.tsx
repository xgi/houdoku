// input-tags.tsx

'use client';

import * as React from 'react';
import { Badge } from '@/ui/components/Badge';
import { Button } from '@/ui/components/Button';
import { XIcon } from 'lucide-react';
import { cn } from '@/ui/util';

type InputTagsProps = Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string[];
  onChange: (value: ReadonlyArray<string>) => void;
};

const InputTags = React.forwardRef<HTMLInputElement, InputTagsProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = React.useState('');

    React.useEffect(() => {
      if (pendingDataPoint.includes(',')) {
        const newDataPoints = new Set([
          ...value,
          ...pendingDataPoint.split(',').map((chunk) => chunk.trim()),
        ]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    }, [pendingDataPoint, onChange, value]);

    const addPendingDataPoint = () => {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint('');
      }
    };

    return (
      <div
        // className={cn(
        //   // ' has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-950 has-[:focus-visible]:ring-offset-2 dark:has-[:focus-visible]:ring-neutral-300 min-h-10 flex w-full flex-wrap gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm ring-offset-white  disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950',
        //   ' min-h-10 flex w-full flex-wrap gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 ring-offset-white dark:border-neutral-800 dark:bg-neutral-950 dark:ring-offset-neutral-950',
        //   className,
        // )}
        className={cn(
          'flex flex-wrap min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 gap-2 shadow-sm transition-colors has-[:focus-visible]:outline-none has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
      >
        {value.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className={cn(props.disabled && 'cursor-not-allowed')}
          >
            {item}
            <Button
              variant="ghost"
              size="icon"
              className={cn('ml-2 h-3 w-3', props.disabled && 'hidden')}
              onClick={() => {
                onChange(value.filter((i) => i !== item));
              }}
            >
              <XIcon className="w-3" />
            </Button>
          </Badge>
        ))}
        <input
          className="flex-1 outline-none placeholder:text-muted-foreground bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          value={pendingDataPoint}
          onChange={(e) => setPendingDataPoint(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addPendingDataPoint();
            } else if (e.key === 'Backspace' && pendingDataPoint.length === 0 && value.length > 0) {
              e.preventDefault();
              onChange(value.slice(0, -1));
            }
          }}
          {...props}
          ref={ref}
        />
      </div>
    );
  },
);

InputTags.displayName = 'InputTags';

export { InputTags };
