import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import log from 'electron-log';
import { v4 as uuidv4 } from 'uuid';
import { walk } from './filesystem';
import { IMAGE_EXTENSIONS } from '../constants/constants.json';

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

export async function extract(
  archive: string,
  internalFilenames: string[],
  baseOutputPath: string
): Promise<string[]> {
  log.info(
    `Extracting ${internalFilenames.length} files from ${archive} to ${baseOutputPath}`
  );

  if (!fs.existsSync(baseOutputPath)) {
    fs.mkdirSync(baseOutputPath, { recursive: true });
  }

  // remove existing image files
  const existingFilenames = walk(baseOutputPath).filter((file) =>
    IMAGE_EXTENSIONS.some((ext) => file.endsWith(`.${ext}`))
  );
  existingFilenames.forEach((existingFilename) =>
    fs.unlinkSync(existingFilename)
  );

  // remove existing directories
  fs.readdirSync(baseOutputPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
      try {
        fs.rmdirSync(path.join(baseOutputPath, dirent.name));
      } catch (e) {
        log.error(
          `Could not remove directory in extracted location: ${dirent.name}`,
          e
        );
      }
    });

  // load archive file
  const zip = await new JSZip.external.Promise((resolve, reject) => {
    fs.readFile(archive, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data: any) => {
    return JSZip.loadAsync(data);
  });

  // Extract each file from the zip (that is included in internalFilenames) and return
  // the extracted paths. We wait until the extraction is completed before returning
  // so that the client doesn't try to load the images before they are fully extracted.
  // Files are extracted to a subdirectory with an arbitrary UUID to prevent the rare possibility
  // of this function being run concurrently.
  const subdirectory = uuidv4();
  fs.mkdirSync(path.join(baseOutputPath, subdirectory), { recursive: true });

  return Promise.all(
    internalFilenames.map(async (internalFilename) => {
      return new Promise((resolve, reject) => {
        const outputPath = path.join(
          baseOutputPath,
          subdirectory,
          path.basename(internalFilename)
        );

        const file = zip.file(internalFilename);
        if (file) {
          file
            .nodeStream()
            .pipe(fs.createWriteStream(outputPath))
            .on('finish', function () {
              resolve(outputPath);
            });
        } else {
          log.error(`File not in archive: ${internalFilename}`);
          reject();
        }
      });
    })
  );
}
