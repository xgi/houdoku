export default {
  write(entryName: string, data: any) {
    window.localStorage.setItem(entryName, `${data}`);
  },

  read(entryName: string): string | null {
    return window.localStorage.getItem(entryName);
  },
};
