import storeKeys from '../constants/storeKeys.json';
import persistantStore from './persistantStore';

export const createBackup = async () => {
  const seriesListStr = persistantStore.read(storeKeys.LIBRARY.SERIES_LIST);
  const blob = new Blob([JSON.stringify(seriesListStr)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `houdoku_series_backup_${new Date()
    .toJSON()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const restoreBackup = (backupFileContent: string) => {
  persistantStore.write(
    storeKeys.LIBRARY.SERIES_LIST,
    JSON.parse(backupFileContent)
  );
};
