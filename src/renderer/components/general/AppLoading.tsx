import React from 'react';
import { AppLoadStep } from '@/common/models/types';

type Props = {
  step?: AppLoadStep;
};

const AppLoading: React.FC<Props> = () => {
  return (
    <div className="flex flex-col w-full h-[calc(100vh-64px)] justify-center items-center align-middle space-y-2">
      <h4 className="uppercase font-extrabold tracking-wider">Houdoku is loading</h4>
      <span>Please wait a moment.</span>
    </div>
  );
};

export default AppLoading;
