
export type Category = 'Skincare' | 'Medicine' | 'Kitchen' | 'Other';

export enum ExpiryStatus {
  SAFE = 'SAFE',
  WARNING = 'WARNING',
  EXPIRED = 'EXPIRED'
}

export type ViewMode = 'grid' | 'list';

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
  imageUrl?: string;
  price?: number; // Added for savings tracking
  isUsed?: boolean; // Added to track salvaged items
  isPriority?: boolean;
}

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
  dot: string;
  glow: string;
}
