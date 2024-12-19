import library from '@/renderer/services/library';
import { categoryListState } from '@/renderer/state/libraryStates';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@houdoku/ui/components/Dialog';
import { Label } from '@houdoku/ui/components/Label';
import { Button } from '@houdoku/ui/components/Button';
import { Input } from '@houdoku/ui/components/Input';
import { Category } from '@/common/models/types';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
};

export const EditCategoryDialog: React.FC<Props> = (props: Props) => {
  const [categoryName, setCategoryName] = useState(props.category.label);
  const setCategories = useSetRecoilState(categoryListState);

  const saveCategory = () => {
    library.upsertCategory({ id: props.category.id, label: categoryName });
    setCategories(library.fetchCategoryList());
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit category</DialogTitle>
          <DialogDescription>Edit an existing category.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newCategoryName" className="text-right">
              Name
            </Label>
            <Input
              id="newCategoryName"
              className="col-span-3"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => saveCategory()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
