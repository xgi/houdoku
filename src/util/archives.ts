import fs from 'fs';
import JSZip from 'jszip';

/**
 * Get a list of all files within an archive.
 * @param archive the path of the archive to read from
 * @returns promise for a list of all file paths within the archive
 */
export async function getArchiveFiles(archive: string): Promise<string[]> {
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

/**
 * Get the Base64 encoding for a file in an archive.
 * @param archive the path of the archive to read from
 * @param file the path of the file within the archive to read
 * @returns promise for the Base64-encoded contents of the file
 */
export async function getArchiveFileBase64(
  archive: string,
  file: string
): Promise<string> {
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
