import library from '@/renderer/services/library';
import { categoryListState } from '@/renderer/state/libraryStates';
import { useSetRecoilState } from 'recoil';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@houdoku/ui/components/Dialog';
import { Button } from '@houdoku/ui/components/Button';
import { Category } from '@/common/models/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
};

export const RemoveCategoryDialog: React.FC<Props> = (props: Props) => {
  const setCategories = useSetRecoilState(categoryListState);

  const removeCateogry = () => {
    library.removeCategory(props.category.id);
    setCategories(library.fetchCategoryList());
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove category</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p>
            Are you sure you want to remove the{' '}
            <span className="font-semibold">{props.category.label}</span> category? Its series will
            remain in your library.
          </p>
        </div>
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant={'destructive'} type="submit" onClick={() => removeCateogry()}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
