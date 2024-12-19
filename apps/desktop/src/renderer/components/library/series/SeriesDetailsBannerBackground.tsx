import React from 'react';
import { useRecoilValue } from 'recoil';
import { seriesBannerUrlState } from '@/renderer/state/libraryStates';
import { cn } from '@houdoku/ui/util';

type Props = {
  children?: React.ReactNode;
};

export const SeriesDetailsBannerBackground: React.FC<Props> = (props: Props) => {
  const seriesBannerUrl = useRecoilValue(seriesBannerUrlState);

  if (!seriesBannerUrl) {
    return (
      <div
        className={cn(
          'w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-cover',
        )}
      >
        {props.children}
      </div>
    );
  }

  return (
    <>
      <div
        style={{ backgroundImage: `url(${seriesBannerUrl})` }}
        className={cn('w-full h-full bg-cover')}
      >
        <div
          style={{
            background: 'rgba(0,0,0,.2)',
          }}
          className="w-full h-full"
        >
          {props.children}
        </div>
      </div>
    </>
  );
};
