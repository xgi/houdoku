import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Affix, Button } from '@mantine/core';
import { IconArrowLeft, IconHeart } from '@tabler/icons';
import { Series } from '@tiyo/common';
import { downloadCover } from '../../../util/download';
import library from '../../../services/library';
import { seriesListState } from '../../../state/libraryStates';
import routes from '../../../constants/routes.json';

type Props = {
  series: Series;
};

const SeriesDetailsFloatingHeader: React.FC<Props> = (props: Props) => {
  const setSeriesList = useSetRecoilState(seriesListState);

  return (
    <>
      <Affix position={{ top: 29, left: 205 }} zIndex={0}>
        {props.series.preview ? (
          <Link to={routes.SEARCH}>
            <Button size="sm" leftIcon={<IconArrowLeft size={16} />} variant="default">
              Back to search
            </Button>
          </Link>
        ) : (
          <Link to={routes.LIBRARY}>
            <Button
              size="sm"
              leftIcon={<IconArrowLeft size={16} />}
              variant="default"
              onClick={() => setSeriesList(library.fetchSeriesList())}
            >
              Back to library
            </Button>
          </Link>
        )}
      </Affix>

      {props.series.preview ? (
        <Affix position={{ top: 29, right: 20 }} zIndex={0}>
          <Button
            size="sm"
            color="teal"
            leftIcon={<IconHeart size={16} />}
            variant="filled"
            onClick={() => {
              downloadCover(props.series);
              library.upsertSeries({ ...props.series, preview: false });
              setSeriesList(library.fetchSeriesList());
            }}
          >
            Add to library
          </Button>
        </Affix>
      ) : (
        ''
      )}
    </>
  );
};

export default SeriesDetailsFloatingHeader;
