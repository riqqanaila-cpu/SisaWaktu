
import { ExpiryItem } from '../types';

const STORAGE_KEY = 'sisawaktu_items';

export const saveItems = (items: ExpiryItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getItems = (): ExpiryItem[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};
