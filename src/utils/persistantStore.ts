export default {
  write(entryName: string, data: any) {
    window.localStorage.setItem(entryName, JSON.stringify(data));
  },

  read(entryName: string) {
    const data: string | null = window.localStorage.getItem(entryName);
    return data != null ? JSON.parse(data) : null;
  },
};
