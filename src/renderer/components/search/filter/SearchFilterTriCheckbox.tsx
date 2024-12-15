import React from 'react';
import { TriState } from '@tiyo/common';
import { Check, XIcon } from 'lucide-react';
import { Checkbox } from '@/ui/components/Checkbox';
import { Label } from '@/ui/components/Label';

type Props = {
  label: string;
  value: TriState;
  onChange: (value: TriState) => void;
};

const SearchFilterTriCheckbox: React.FC<Props> = (props: Props) => {
  const toggleValue = () => {
    props.onChange(
      {
        [TriState.IGNORE]: TriState.INCLUDE,
        [TriState.INCLUDE]: TriState.EXCLUDE,
        [TriState.EXCLUDE]: TriState.IGNORE,
      }[props.value],
    );
  };

  return (
    <div className="flex items-center space-x-2" onClick={() => toggleValue()}>
      <Checkbox
        id={`checkbox${props.label}`}
        checked={props.value !== TriState.IGNORE}
        className="w-5 h-5"
        icon={
          {
            [TriState.IGNORE]: undefined,
            [TriState.INCLUDE]: <Check className="h-4 w-4" />,
            [TriState.EXCLUDE]: <XIcon className="h-4 w-4" />,
          }[props.value]
        }
      />
      <Label htmlFor={`checkbox${props.label}`}>{props.label}</Label>
    </div>
  );
};

export default SearchFilterTriCheckbox;
