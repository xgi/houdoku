/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { Chapter, Series } from 'houdoku-extension-lib';
import lf from 'lovefield';
import path from 'path';
import fs from 'fs';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import library from '../services/library';
import ipcChannels from '../constants/ipcChannels.json';

const createSchemaBuilder = (): lf.schema.Builder => {
  const schemaBuilder = lf.schema.create('houdoku', 2);

  schemaBuilder
    .createTable('series')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('extensionId', lf.Type.STRING)
    .addColumn('sourceId', lf.Type.STRING)
    .addColumn('sourceType', lf.Type.OBJECT)
    .addColumn('title', lf.Type.STRING)
    .addColumn('altTitles', lf.Type.OBJECT)
    .addColumn('description', lf.Type.STRING)
    .addColumn('authors', lf.Type.OBJECT)
    .addColumn('artists', lf.Type.OBJECT)
    .addColumn('genres', lf.Type.OBJECT)
    .addColumn('themes', lf.Type.OBJECT)
    .addColumn('contentWarnings', lf.Type.OBJECT)
    .addColumn('formats', lf.Type.OBJECT)
    .addColumn('demographic', lf.Type.OBJECT)
    .addColumn('status', lf.Type.OBJECT)
    .addColumn('originalLanguageKey', lf.Type.OBJECT)
    .addColumn('numberUnread', lf.Type.INTEGER)
    .addColumn('remoteCoverUrl', lf.Type.STRING)
    .addColumn('userTags', lf.Type.OBJECT)
    .addColumn('trackerKeys', lf.Type.OBJECT)
    .addPrimaryKey(['id'], true);
  schemaBuilder
    .createTable('chapter')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('seriesId', lf.Type.NUMBER)
    .addColumn('sourceId', lf.Type.STRING)
    .addColumn('title', lf.Type.STRING)
    .addColumn('chapterNumber', lf.Type.STRING)
    .addColumn('volumeNumber', lf.Type.STRING)
    .addColumn('languageKey', lf.Type.OBJECT)
    .addColumn('groupName', lf.Type.STRING)
    .addColumn('time', lf.Type.NUMBER)
    .addColumn('read', lf.Type.BOOLEAN)
    .addPrimaryKey(['id'], true);

  return schemaBuilder;
};

// eslint-disable-next-line import/prefer-default-export
export const performMigration = async () => {
  log.debug('lovefield migration - connected to DB');
  const db: lf.Database = await createSchemaBuilder().connect();
  const seriesTable = db.getSchema().table('series');
  const chapterTable = db.getSchema().table('chapter');

  const seriesList = await (db.select().from(seriesTable).exec() as Promise<
    Series[]
  >);
  const chapterList = await (db.select().from(chapterTable).exec() as Promise<
    Chapter[]
  >);

  if (seriesList.length === 0) {
    log.debug('No series in DB found, ending migration');
    return;
  }
  log.debug(
    `lovefield DB contained ${seriesList.length} series, starting migration`
  );

  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DEFAULT_DOWNLOADS_DIR
  );
  const thumbnailsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.THUMBNAILS_DIR
  );

  seriesList.forEach((series: Series) => {
    if (!series.id) return;
    log.debug(`migrating series with id ${series.id}`);

    const chapters = chapterList.filter(
      (chapter) => chapter.seriesId === series.id
    );

    // strip IDs from series and chapters before adding to the new library
    const newSeries = library.upsertSeries({ ...series, id: undefined });
    library.upsertChapters(
      chapters.map((c) => ({ ...c, id: undefined })),
      newSeries
    );
    if (newSeries.id === undefined) return;
    const newChapters = library.fetchChapters(newSeries.id);
    log.debug(
      `added series to new DB with id ${newSeries.id} along with ${newChapters.length} chapters`
    );

    // rename downloaded chapter/series paths using their IDs
    const seriesDirPath = path.join(downloadsDir, series.id.toString());
    if (fs.existsSync(seriesDirPath)) {
      for (const chapterDirName of fs.readdirSync(seriesDirPath)) {
        if (!Number.isNaN(chapterDirName)) {
          const existingChapter = chapters.find(
            (c) => c.id?.toString() === chapterDirName
          );
          if (!existingChapter) continue;

          const newChapter = newChapters.find(
            (c) =>
              c.chapterNumber === existingChapter.chapterNumber &&
              c.languageKey === existingChapter.languageKey &&
              c.groupName === existingChapter.groupName &&
              c.title === existingChapter.title
          );
          if (!newChapter || !newChapter.id) continue;

          const sourcePath = path.join(seriesDirPath, chapterDirName);
          const destPath = path.join(seriesDirPath, newChapter.id);
          log.debug(`renaming chapter dir: ${sourcePath} -> ${destPath}`);
          fs.renameSync(sourcePath, destPath);
        }
      }

      const destPath = path.join(downloadsDir, newSeries.id);
      log.debug(`renaming series dir: ${seriesDirPath} -> ${destPath}`);
      fs.renameSync(seriesDirPath, destPath);
    }

    // rename thumbnail path
    const fileExtensions = ['jpg', 'png', 'jpeg'];
    for (let i = 0; i < fileExtensions.length; i += 1) {
      const thumbnailPath = path.join(
        thumbnailsDir,
        `${series.id}.${fileExtensions[i]}`
      );
      if (fs.existsSync(thumbnailPath)) {
        const destPath = path.join(
          thumbnailsDir,
          `${newSeries.id}.${fileExtensions[i]}`
        );
        log.debug(`renaming thumbnail: ${thumbnailPath} -> ${destPath}`);
        fs.renameSync(thumbnailPath, destPath);
      }
    }
  });

  log.debug('exporting lovefield DB');
  db.export()
    // eslint-disable-next-line promise/always-return
    .then(async (data: unknown) => {
      const baseAppPath = path.dirname(downloadsDir);
      const destPath = path.join(baseAppPath, 'lovefield-db.bak');
      log.debug(`writing lovefield DB export to ${destPath}`);
      fs.writeFileSync(destPath, JSON.stringify(data));

      log.debug('deleting contents from lovefield DB');
      await db.delete().from(seriesTable).exec();
      await db.delete().from(chapterTable).exec();

      log.debug('lovefield database migration complete');
    })
    .catch((e) => log.error(e));
};
