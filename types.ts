
export type Category = 'Skincare' | 'Medicine' | 'Kitchen' | 'Other';

export enum ExpiryStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED'
}

export interface UserSettings {
  browserAlerts: boolean;
  leadDays: number;
}

export interface ExpiryItem {
  id: string;
  name: string;
  category: Category;
  expiryDate: string;
  createdAt: number;
  isPriority?: boolean; // H-3 items
}

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
  dot: string;
}
