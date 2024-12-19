import { Button } from '@houdoku/ui/components/Button';
import React from 'react';

type Props = {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

const SearchFilterCycle: React.FC<Props> = (props: Props) => {
  const toggleValue = () => {
    const curIndex = props.options.findIndex((option) => option.value === props.value);
    props.onChange(props.options[(curIndex + 1) % props.options.length].value);
  };

  const currentLabel = props.options.find((option) => option.value === props.value)?.label;

  return (
    <Button className="w-full" variant="outline" onClick={() => toggleValue()}>
      <span>
        {props.label}: {currentLabel}
      </span>
    </Button>
  );
};

export default SearchFilterCycle;
