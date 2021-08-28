/* eslint-disable no-restricted-syntax */
import { Chapter, Series } from 'houdoku-extension-lib';
import lf from 'lovefield';
import path from 'path';
import fs from 'fs';
import { ipcRenderer } from 'electron';
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
  const db: lf.Database = await createSchemaBuilder().connect();
  const seriesTable = db.getSchema().table('series');
  const chapterTable = db.getSchema().table('chapter');

  const seriesList = await (db.select().from(seriesTable).exec() as Promise<
    Series[]
  >);
  const chapterList = await (db.select().from(chapterTable).exec() as Promise<
    Chapter[]
  >);

  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DOWNLOADS_DIR
  );

  seriesList.forEach((series: Series) => {
    if (!series.id) return;

    const chapters = chapterList.filter(
      (chapter) => chapter.seriesId === series.id
    );

    const newSeries = library.upsertSeries(series);
    library.upsertChapters(chapters, series);
    if (newSeries.id === undefined) return;
    const newChapters = library.fetchChapters(newSeries.id);

    const seriesDirPath = path.join(downloadsDir, series.id.toString());
    if (fs.existsSync(seriesDirPath)) {
      for (const chapterDirName of fs.readdirSync(seriesDirPath)) {
        if (!Number.isNaN(chapterDirName)) {
          const existingChapter = chapters.find((c) => c.id === chapterDirName);
          if (!existingChapter) return;

          const newChapter = newChapters.find(
            (c) =>
              c.chapterNumber === existingChapter.chapterNumber &&
              c.languageKey === existingChapter.languageKey &&
              c.groupName === existingChapter.groupName &&
              c.title === existingChapter.title
          );
          if (!newChapter || !newChapter.id) return;

          fs.renameSync(
            path.join(seriesDirPath, chapterDirName),
            path.join(seriesDirPath, newChapter.id)
          );
        }
      }

      fs.renameSync(seriesDirPath, path.join(downloadsDir, newSeries.id));
    }
  });
};
