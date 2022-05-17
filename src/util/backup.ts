import persistantStore from '../util/persistantStore';

export const downloadFile = async () => {
  const myData = persistantStore.downloadSettings();
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
  reader.onload = (e) => {
    if (e.target) {
      const text: string | ArrayBuffer | null = JSON.parse(e.target.result);
      persistantStore.restoreSettings(text);
    }
  };
  reader.readAsBinaryString(e.target.files[0]);
};
