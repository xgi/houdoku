export default {
  write(entryName: string, data: unknown) {
    window.localStorage.setItem(entryName, `${data}`);
  },

  read(entryName: string): string | null {
    return window.localStorage.getItem(entryName);
  },

  remove(entryName: string): void {
    return window.localStorage.removeItem(entryName);
  },
};
