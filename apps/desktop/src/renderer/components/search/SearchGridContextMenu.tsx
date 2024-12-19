import React, { useEffect, useState } from 'react';
import { Series } from '@tiyo/common';
import { useRecoilState, useRecoilValue } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { importingState, importQueueState } from '@/renderer/state/libraryStates';
import { goToSeries } from '@/renderer/features/library/utils';
import { ContextMenuContent, ContextMenuItem } from '@houdoku/ui/components/ContextMenu';
import { BookPlus, Eye, Play } from 'lucide-react';

type Props = {
  series: Series;
  viewDetails: () => void;
};

const SearchGridContextMenu: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [importQueue, setImportQueue] = useRecoilState(importQueueState);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewSeries, setPreviewSeries] = useState<Series>();
  const importing = useRecoilValue(importingState);

  const importHandler = () => {
    setImportQueue([...importQueue, { series: props.series, getFirst: true }]);
  };

  const previewHandler = () => {
    const tempPreviewSeries: Series = { ...props.series, id: uuidv4(), preview: true };
    setPreviewSeries(tempPreviewSeries);
    setImportQueue([...importQueue, { series: tempPreviewSeries, getFirst: false }]);
    setLoadingPreview(true);
  };

  useEffect(() => {
    if (loadingPreview && previewSeries && !importing) {
      setLoadingPreview(false);
      goToSeries(previewSeries, navigate);
    }
  }, [importQueue, loadingPreview]);

  return (
    <ContextMenuContent className="w-48">
      <ContextMenuItem onClick={() => props.viewDetails()}>
        <Eye className="h-4 w-4 mr-2" />
        View details
      </ContextMenuItem>
      <ContextMenuItem onClick={() => importHandler()}>
        <BookPlus className="h-4 w-4 mr-2" />
        Add to library
      </ContextMenuItem>
      <ContextMenuItem onClick={() => previewHandler()}>
        <Play className="h-4 w-4 mr-2" />
        Preview
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default SearchGridContextMenu;
