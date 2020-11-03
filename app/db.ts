/* eslint-disable import/no-mutable-exports */
import lf from 'lovefield';
import db from './services/db';

const schemaBuilder = lf.schema.create('houdoku', 1);

schemaBuilder
  .createTable('series')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('author', lf.Type.STRING)
  .addColumn('artist', lf.Type.STRING)
  .addPrimaryKey(['id'], true);

schemaBuilder
  .createTable('chapter')
  .addColumn('id', lf.Type.INTEGER)
  .addColumn('title', lf.Type.STRING)
  .addColumn('chapterNumber', lf.Type.NUMBER)
  .addColumn('volumeNumber', lf.Type.NUMBER)
  .addColumn('series_id', lf.Type.NUMBER)
  .addPrimaryKey(['id'], true);

export let database: lf.Database;
export let seriesTable: lf.schema.Table;
export let chapterTable: lf.schema.Table;

export async function init() {
  database = await schemaBuilder.connect();
  seriesTable = database.getSchema().table('series');
  chapterTable = database.getSchema().table('chapter');
}
