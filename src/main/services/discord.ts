import { IpcMain } from 'electron';
import DiscordRPC from 'discord-rpc';
import { Chapter, Series } from '@tiyo/common';
import ipcChannels from '../../common/constants/ipcChannels.json';
import packageJson from '../../../package.json';

function getActivity(
  startTime: Date,
  series?: Series,
  chapter?: Chapter,
): DiscordRPC.Presence | undefined {
  if (series === undefined || chapter === undefined) return undefined;

  return {
    details: `${series.title}`,
    state: `Chapter ${chapter.chapterNumber}`,
    startTimestamp: startTime,
    largeImageKey: series.remoteCoverUrl ? series.remoteCoverUrl : 'logo',
    smallImageKey: series.remoteCoverUrl ? 'logo' : undefined,
    largeImageText: series.title,
    smallImageText: packageJson.productName,
    instance: false,
  };
}

// eslint-disable-next-line import/prefer-default-export
export const createDiscordIpcHandlers = (ipcMain: IpcMain) => {
  console.debug('Creating Discord IPC handlers in main...');

  const startTime = new Date();
  let client: DiscordRPC.Client | null = null;

  ipcMain.handle(
    ipcChannels.INTEGRATION.DISCORD_SET_ACTIVITY,
    async (_event, series: Series, chapter: Chapter) => {
      const activity = getActivity(startTime, series, chapter);

      if (client === null) {
        console.debug("Request to set Discord activity, but client isn't set; connecting...");
        const clientId = '856668322672934932';
        client = new DiscordRPC.Client({ transport: 'ipc' });

        client.on('ready', () => {
          if (client !== null) {
            client.setActivity(activity);
          }
        });
        client.login({ clientId });
      } else {
        console.debug(
          `Setting Discord activity for ${
            chapter === undefined ? 'no chapter' : `chapter ${chapter.id}`
          }`,
        );
        client.setActivity(activity);
      }
    },
  );
};
