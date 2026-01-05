
import { CleaningReport } from '../types';

const STORAGE_KEY = 'cleanse_ai_history';

export const saveReport = (report: CleaningReport) => {
  const history = getHistory();
  const updatedHistory = [report, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
};

export const getHistory = (): CleaningReport[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
