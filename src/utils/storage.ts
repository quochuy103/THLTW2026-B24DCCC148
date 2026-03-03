export const StorageKeys = {
  PRODUCTS: 'APP_PRODUCTS',
  ORDERS: 'APP_ORDERS',
  STUDY_TRACKER: 'APP_STUDY_TRACKER',
};

export const getStorageData = <T>(key: string, initialValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

export const setStorageData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
};
