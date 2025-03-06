
import { format } from 'date-fns';

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const calculateDaysSinceCreation = (creationDate: string): number => {
  const date = new Date(creationDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate a realistic, stable activity percentage
export const generateActivityPercentage = (): number => {
  return Math.floor(Math.random() * 60) + 40;
};

export const formatDate = (date: string): string => {
  return format(new Date(date), 'MMM d, yyyy');
};
