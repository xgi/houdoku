import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createExtractorFromData } from 'node-unrar-js';

const ZIP_EXTENSIONS = ['.zip', '.cbz'];
const RAR_EXTENSIONS = ['.rar', '.cbr'];

async function extractZip(archive: string, archiveOutputPath: string): Promise<string[]> {
  const zip = await new JSZip.external.Promise<Buffer>((resolve, reject) => {
    fs.readFile(archive, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  }).then((data: Buffer) => {
    return JSZip.loadAsync(data);
  });

  return Promise.all(
    Object.keys(zip.files).map((internalFilename) => {
      return new Promise<string>((resolve) => {
        const outputPath = path.join(archiveOutputPath, path.basename(internalFilename));
        zip.files[internalFilename]
          .nodeStream()
          .pipe(fs.createWriteStream(outputPath))
          .on('finish', () => resolve(outputPath));
      });
    }),
  );
}

async function extractRar(archive: string, archiveOutputPath: string): Promise<string[]> {
  const buf = Uint8Array.from(fs.readFileSync(archive)).buffer;
  const extractor = await createExtractorFromData({ data: buf });

  const { files: rarFiles } = extractor.extract({
    files: ({ flags }) => !flags.encrypted,
  });

  const extractedPaths: string[] = [];
  for (const { extraction, fileHeader } of rarFiles) {
    if (!fileHeader.flags.directory) {
      const outputPath = path.join(archiveOutputPath, path.basename(fileHeader.name));
      const outputBuf: Uint8Array = extraction as unknown as Uint8Array;
      fs.writeFileSync(outputPath, outputBuf);
      extractedPaths.push(outputPath);
    }
  }

  return extractedPaths;
}

/**
 * Extract an archive to the filesystem.
 * Files are extracted to a temporary location and previous data is cleared at the start
 * of this function before new files are extracted.
 * @param archive path of archive file
 * @param baseOutputPath temporary location to save extracted files
 * @returns list of extracted file paths
 */
export async function extract(archive: string, baseOutputPath: string): Promise<string[]> {
  console.info(`Extracting files from ${archive} to ${baseOutputPath}`);

  if (!fs.existsSync(baseOutputPath)) {
    fs.mkdirSync(baseOutputPath, { recursive: true });
  }

  // remove existing directories
  fs.readdirSync(baseOutputPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .forEach((dirent) => {
      try {
        fs.rmSync(path.join(baseOutputPath, dirent.name), { recursive: true });
      } catch (e) {
        console.error(`Could not remove directory in extracted location: ${dirent.name}`, e);
      }
    });

  // Extract each file from the zip and return the extracted paths. We wait until the extraction is
  // completed before returning so that the client doesn't try to load the images before they are
  // fully extracted. Files are extracted to a subdirectory with an arbitrary UUID to prevent the
  // rare possibility of this function being run concurrently.
  const subdirectory = uuidv4();
  const archiveOutputPath = path.join(baseOutputPath, subdirectory);
  fs.mkdirSync(archiveOutputPath, { recursive: true });

  if (ZIP_EXTENSIONS.some((ext) => archive.endsWith(ext))) {
    return extractZip(archive, archiveOutputPath);
  }
  if (RAR_EXTENSIONS.some((ext) => archive.endsWith(ext))) {
    return extractRar(archive, archiveOutputPath);
  }
  throw Error(`Tried to extract unsupported archive: ${archive}`);
}
