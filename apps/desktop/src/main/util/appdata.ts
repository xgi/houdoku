import path from 'path';
import { app } from 'electron';

export const THUMBNAILS_DIR = path.join(app.getPath('userData'), 'thumbnails');
export const PLUGINS_DIR = path.join(app.getPath('userData'), 'plugins');
export const DEFAULT_DOWNLOADS_DIR = path.join(app.getPath('userData'), 'downloads');
export const LOGS_DIR = path.join(app.getPath('userData'), 'logs');
export const EXTRACT_DIR = path.join(app.getPath('userData'), 'extracted');
