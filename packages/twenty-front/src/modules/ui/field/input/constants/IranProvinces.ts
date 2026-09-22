import { IRAN_PROVINCES_AND_CITIES } from '@/ui/field/input/constants/IranProvincesAndCities';

export const IRAN_PROVINCES = Object.keys(IRAN_PROVINCES_AND_CITIES).sort(
  (a, b) => a.localeCompare(b, 'fa'),
);
