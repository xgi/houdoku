import storeKeys from '../constants/storeKeys.json';
import persistantStore from '../util/persistantStore';

export const createBackup = async () => {
  const myData = persistantStore.read(storeKeys.LIBRARY.SERIES_LIST);
  const fileName = 'backup';
  const json = JSON.stringify(myData);
  const blob = new Blob([json], { type: 'application/json' });
  const href = await URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const restoreBackup = (e: any) => {
  e.preventDefault();
  const reader = new FileReader();
  reader.onload = (progressEvent: any) => {
    if (progressEvent.target) {
      const text: string | ArrayBuffer | null = JSON.parse(
        progressEvent.target.result
      );
      persistantStore.write(storeKeys.LIBRARY.SERIES_LIST, text);
    }
  };
  reader.readAsBinaryString(e.target.files[0]);
};
