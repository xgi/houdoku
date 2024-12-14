import { v4 as uuidv4 } from 'uuid';
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
} from '@/ui/components/Dialog';
import { Alert, AlertDescription } from '@/ui/components/Alert';
import { Label } from '@/ui/components/Label';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewCategoryDialog: React.FC<Props> = (props: Props) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const setCategories = useSetRecoilState(categoryListState);

  const saveNewCategory = () => {
    library.upsertCategory({ id: uuidv4(), label: newCategoryName });
    setCategories(library.fetchCategoryList());
    props.onOpenChange(false);
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create category</DialogTitle>
          <DialogDescription>Use categories to organize your library.</DialogDescription>
        </DialogHeader>
        <Alert>
          <AlertDescription>
            After creating a category, you can populate it by right clicking a series in your
            library.
          </AlertDescription>
        </Alert>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newCategoryName" className="text-right">
              Name
            </Label>
            <Input
              id="newCategoryName"
              className="col-span-3"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant={'secondary'} onClick={() => props.onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => saveNewCategory()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
