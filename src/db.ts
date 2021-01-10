/* eslint-disable import/no-mutable-exports */
import lf from 'lovefield';

const schemaBuilder = lf.schema.create('houdoku', 1);

schemaBuilder
  .createTable('series')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('extensionId', lf.Type.INTEGER)
  .addColumn('sourceId', lf.Type.STRING)
  .addColumn('title', lf.Type.STRING)
  .addColumn('altTitles', lf.Type.OBJECT)
  .addColumn('description', lf.Type.STRING)
  .addColumn('authors', lf.Type.OBJECT)
  .addColumn('artists', lf.Type.OBJECT)
  .addColumn('genres', lf.Type.OBJECT)
  .addColumn('themes', lf.Type.OBJECT)
  .addColumn('contentWarnings', lf.Type.OBJECT)
  .addColumn('formats', lf.Type.OBJECT)
  .addColumn('status', lf.Type.OBJECT)
  .addColumn('originalLanguage', lf.Type.OBJECT)
  .addColumn('remoteCoverUrl', lf.Type.STRING)
  .addPrimaryKey(['id'], true);

schemaBuilder
  .createTable('chapter')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('seriesId', lf.Type.NUMBER)
  .addColumn('sourceId', lf.Type.STRING)
  .addColumn('title', lf.Type.STRING)
  .addColumn('chapterNumber', lf.Type.STRING)
  .addColumn('volumeNumber', lf.Type.STRING)
  .addColumn('language', lf.Type.OBJECT)
  .addColumn('time', lf.Type.NUMBER)
  .addPrimaryKey(['id'], true);

export let database: lf.Database;
export let seriesTable: lf.schema.Table;
export let chapterTable: lf.schema.Table;

export async function init() {
  database = await schemaBuilder.connect();
  seriesTable = database.getSchema().table('series');
  chapterTable = database.getSchema().table('chapter');
}
