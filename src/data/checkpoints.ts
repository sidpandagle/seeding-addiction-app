export interface Checkpoint {
  id: string;
  label: string;
  shortLabel: string;
  duration: number; // in milliseconds
}

export const CHECKPOINTS: Checkpoint[] = [
  { id: '6hr', label: '6 hours', shortLabel: '6 hrs', duration: 6 * 60 * 60 * 1000 },
  { id: '12hr', label: '12 hours', shortLabel: '12 hrs', duration: 12 * 60 * 60 * 1000 },
  { id: '1d', label: '1 day', shortLabel: '1 day', duration: 1 * 24 * 60 * 60 * 1000 },
  { id: '2d', label: '2 days', shortLabel: '2 days', duration: 2 * 24 * 60 * 60 * 1000 },
  { id: '3d', label: '3 days', shortLabel: '3 days', duration: 3 * 24 * 60 * 60 * 1000 },
  { id: '7d', label: '7 days', shortLabel: '1 week', duration: 7 * 24 * 60 * 60 * 1000 },
  { id: '14d', label: '14 days', shortLabel: '2 weeks', duration: 14 * 24 * 60 * 60 * 1000 },
  { id: '21d', label: '21 days', shortLabel: '3 weeks', duration: 21 * 24 * 60 * 60 * 1000 },
  { id: '30d', label: '30 days', shortLabel: '1 month', duration: 30 * 24 * 60 * 60 * 1000 },
  { id: '60d', label: '60 days', shortLabel: '2 months', duration: 60 * 24 * 60 * 60 * 1000 },
  { id: '90d', label: '90 days', shortLabel: '3 months', duration: 90 * 24 * 60 * 60 * 1000 },
  { id: '180d', label: '180 days', shortLabel: '6 months', duration: 180 * 24 * 60 * 60 * 1000 },
  { id: '270d', label: '270 days', shortLabel: '9 months', duration: 270 * 24 * 60 * 60 * 1000 },
  { id: '365d', label: '1 year', shortLabel: '1 year', duration: 365 * 24 * 60 * 60 * 1000 },
];
