import { IRAN_PROVINCES_AND_CITIES } from '@/ui/field/input/constants/IranProvincesAndCities';

export const getCitiesForProvince = (
  provinceName?: string | null,
): string[] => {
  if (!provinceName) return [];
  const cities = IRAN_PROVINCES_AND_CITIES[provinceName.trim()];
  return cities ? [...cities].sort((a, b) => a.localeCompare(b, 'fa')) : [];
};
