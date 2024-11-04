import { TagsInput } from '@mantine/core';
import styles from './DefaultTagsInput.module.css';
import { themeState } from '@/renderer/state/settingStates';
import { useRecoilValue } from 'recoil';
import { themeProps } from '@/renderer/util/themes';

type Props = typeof TagsInput.defaultProps;

const DefaultTagsInput: React.FC<Props> = (props: Props) => {
  const theme = useRecoilValue(themeState);

  return (
    <TagsInput
      wrapperProps={themeProps(theme)}
      classNames={{
        root: styles.root,
        input: styles.input,
        label: styles.label,
        pill: styles.pill,
      }}
      {...props}
    />
  );
};

export default DefaultTagsInput;
