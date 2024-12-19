import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Series } from '@tiyo/common';
import { downloadCover } from '@/renderer/util/download';
import library from '@/renderer/services/library';
import { seriesListState } from '@/renderer/state/libraryStates';
import routes from '@/common/constants/routes.json';
import { ArrowLeftIcon, HeartIcon } from 'lucide-react';
import { Button } from '@houdoku/ui/components/Button';

type Props = {
  series: Series;
};

const SeriesDetailsFloatingHeader: React.FC<Props> = (props: Props) => {
  const setSeriesList = useSetRecoilState(seriesListState);

  return (
    <>
      <div className="fixed top-[29px] left-[205px] z-0">
        {props.series.preview ? (
          <Link to={routes.SEARCH}>
            <Button size="sm">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to search
            </Button>
          </Link>
        ) : (
          <Link to={routes.LIBRARY}>
            <Button size="sm" onClick={() => setSeriesList(library.fetchSeriesList())}>
              <ArrowLeftIcon className="w-4 h-4" />
              Back to library
            </Button>
          </Link>
        )}
      </div>

      {props.series.preview && (
        <div className="fixed top-[29px] right-[15px] z-0">
          <Button
            className="text-neutral-50 bg-emerald-600 hover:bg-emerald-700"
            size="sm"
            onClick={() => {
              downloadCover(props.series);
              library.upsertSeries({ ...props.series, preview: false });
              setSeriesList(library.fetchSeriesList());
            }}
          >
            <HeartIcon className="w-4 h-4" />
            Add to library
          </Button>
        </div>
      )}
    </>
  );
};

export default SeriesDetailsFloatingHeader;
