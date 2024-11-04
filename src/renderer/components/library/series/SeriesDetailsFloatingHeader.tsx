import React from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Affix, Button } from '@mantine/core';
import { IconArrowLeft, IconHeart } from '@tabler/icons';
import { Series } from '@tiyo/common';
import { downloadCover } from '@/renderer/util/download';
import library from '@/renderer/services/library';
import { seriesListState } from '@/renderer/state/libraryStates';
import routes from '@/common/constants/routes.json';
import DefaultButton from '../../general/DefaultButton';

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
            <DefaultButton size="sm" leftSection={<IconArrowLeft size={16} />}>
              Back to search
            </DefaultButton>
          </Link>
        ) : (
          <Link to={routes.LIBRARY}>
            <DefaultButton
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => setSeriesList(library.fetchSeriesList())}
            >
              Back to library
            </DefaultButton>
          </Link>
        )}
      </Affix>

      {props.series.preview ? (
        <Affix position={{ top: 29, right: 20 }} zIndex={0}>
          <Button
            size="sm"
            color="teal"
            leftSection={<IconHeart size={16} />}
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
