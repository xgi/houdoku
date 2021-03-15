/**
 * These methods provide a slight abstraction for localStorage, which is saved between sessions.
 * Currently they are only used for storing the values of settings. For storing library data (i.e.
 * series, chapters, etc) check the DB-related functions.
 */
export default {
  write(entryName: string, data: any) {
    window.localStorage.setItem(entryName, `${data}`);
  },

  read(entryName: string): string | null {
    return window.localStorage.getItem(entryName);
  },
};
