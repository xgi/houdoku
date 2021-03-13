import fs from 'fs';
import JSZip from 'jszip';

export async function getArchiveFiles(archive: string) {
  return new JSZip.external.Promise((resolve, reject) => {
    fs.readFile(archive, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
    .then((data: any) => {
      return JSZip.loadAsync(data);
    })
    .then((zip: any) =>
      Object.values(zip.files)
        .filter((file: any) => !file.dir)
        .map((file: any) => file.name)
    );
}

export async function getArchiveFileBase64(archive: string, file: string) {
  return new JSZip.external.Promise((resolve, reject) => {
    fs.readFile(archive, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
    .then((data: any) => {
      return JSZip.loadAsync(data);
    })
    .then((zip: any) => zip.file(file).async('base64'));
}
