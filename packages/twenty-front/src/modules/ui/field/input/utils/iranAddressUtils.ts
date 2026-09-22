import { isDefined } from 'twenty-shared/utils';

export const isStrictIranAddress = (country?: string | null): boolean => {
  if (!country || !country.trim()) {
    return false;
  }
  const normalized = country.trim().toLowerCase();
  return (
    normalized === 'iran' ||
    normalized === 'iran, islamic republic of' ||
    normalized === 'islamic republic of iran' ||
    country.trim() === 'ایران' ||
    normalized === 'ir'
  );
};

export const isIranAddress = (country?: string | null): boolean => {
  if (!isDefined(country) || country === '') {
    return true;
  }
  return isStrictIranAddress(country);
};

export const formatIranStreet2 = (
  pelak?: string | null,
  unit?: string | null,
): string => {
  const trimmedPelak = pelak?.trim() ?? '';
  const trimmedUnit = unit?.trim() ?? '';

  if (trimmedPelak && trimmedUnit) {
    return `پلاک ${trimmedPelak}، واحد ${trimmedUnit}`;
  }
  if (trimmedPelak) {
    return `پلاک ${trimmedPelak}`;
  }
  if (trimmedUnit) {
    return `واحد ${trimmedUnit}`;
  }
  return '';
};

export const parseIranStreet2 = (
  street2?: string | null,
): { pelak: string; unit: string } => {
  if (!street2 || !street2.trim()) {
    return { pelak: '', unit: '' };
  }

  const pelakMatch = street2.match(/پلاک\s*[:\s]?\s*([^،,\n]+)/);
  const unitMatch = street2.match(/واحد\s*[:\s]?\s*([^،,\n]+)/);

  if (!pelakMatch && !unitMatch) {
    return { pelak: street2.trim(), unit: '' };
  }

  return {
    pelak: pelakMatch ? pelakMatch[1].trim() : '',
    unit: unitMatch ? unitMatch[1].trim() : '',
  };
};
