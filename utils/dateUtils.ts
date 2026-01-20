
import { ExpiryStatus } from '../types';

export const calculateDaysRemaining = (expiryDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate: string): ExpiryStatus => {
  const days = calculateDaysRemaining(expiryDate);
  if (days < 0) return ExpiryStatus.EXPIRED;
  if (days < 7) return ExpiryStatus.WARNING; // Logic update: < 7 days is Yellow
  return ExpiryStatus.SAFE;
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
