export const StorageUtils = {
  getItem: (key: string) => {
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    window.localStorage.removeItem(key);
  },
  clear: () => {
    window.localStorage.clear();
  }
};
