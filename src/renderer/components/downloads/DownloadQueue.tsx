import React from 'react';
import { useRecoilValue } from 'recoil';
import { downloaderClient, DownloadTask } from '@/renderer/services/downloader';
import { currentTaskState, queueState } from '@/renderer/state/downloaderStates';
import { Languages } from '@tiyo/common';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/components/Card';
import { Progress } from '@/ui/components/Progress';
import { ScrollArea } from '@/ui/components/ScrollArea';
import { Button } from '@/ui/components/Button';
import { PauseIcon, PlayIcon } from 'lucide-react';

const DownloadQueue: React.FC = () => {
  const queue = useRecoilValue(queueState);
  const currentTask = useRecoilValue(currentTaskState);

  const renderHeader = () => {
    return (
      <div className="flex justify-between pt-4 pb-2">
        <h2 className="text-xl font-bold">Download Queue</h2>
        {(currentTask || queue.length > 0) && (
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              Clear Queue
            </Button>
            {currentTask === null && queue.length > 0 ? (
              <Button
                className="text-white bg-green-600 hover:bg-green-700"
                size="sm"
                color="teal"
                onClick={() => downloaderClient.start()}
              >
                <PlayIcon className="h-4 w-4" />
                Resume
              </Button>
            ) : (
              <Button
                className="text-white bg-orange-600 hover:bg-orange-700"
                size="sm"
                onClick={() => downloaderClient.pause()}
              >
                <PauseIcon className="h-4 w-4" />
                Pause
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTask = (task: DownloadTask) => {
    const descriptionFields: string[] = [];
    if (task.chapter.languageKey && Languages[task.chapter.languageKey]) {
      descriptionFields.push(Languages[task.chapter.languageKey].name);
    }
    if (task.chapter.groupName) {
      descriptionFields.push(task.chapter.groupName);
    }

    const value = task.page && task.totalPages ? (task.page / task.totalPages) * 100 : 0;
    return (
      <Card className="w-full">
        <CardHeader className="px-4 pt-3 pb-2">
          <CardTitle>
            {task.series.title} - Chapter {task.chapter.chapterNumber}
          </CardTitle>
          <CardDescription>{descriptionFields.join(', ')}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <Progress value={value} title={`${task.page || 0}/${task.totalPages || 0}`} />
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {renderHeader()}
      <ScrollArea type="always" className="h-[40vh] min-h-64">
        <div className="flex flex-col space-y-2 pr-4">
          {currentTask ? renderTask(currentTask) : ''}
          {queue.map((task: DownloadTask) => renderTask(task))}
          {currentTask === null && queue.length === 0 ? (
            <div className="h-[36vh] min-h-60 flex items-center justify-center">
              <span>There are no downloads queued.</span>
            </div>
          ) : (
            ''
          )}
        </div>
      </ScrollArea>
    </>
  );
};

export default DownloadQueue;
