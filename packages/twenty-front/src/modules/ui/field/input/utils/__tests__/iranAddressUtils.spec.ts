import {
  formatIranStreet2,
  isIranAddress,
  isStrictIranAddress,
  parseIranStreet2,
} from '@/ui/field/input/utils/iranAddressUtils';

describe('iranAddressUtils', () => {
  describe('isIranAddress', () => {
    it('should return true for empty or undefined country (defaulting to Iran)', () => {
      expect(isIranAddress()).toBe(true);
      expect(isIranAddress(null)).toBe(true);
      expect(isIranAddress('')).toBe(true);
    });

    it('should return true for variations of Iran', () => {
      expect(isIranAddress('Iran')).toBe(true);
      expect(isIranAddress('iran')).toBe(true);
      expect(isIranAddress('IRAN')).toBe(true);
      expect(isIranAddress('ایران')).toBe(true);
      expect(isIranAddress('ir')).toBe(true);
      expect(isIranAddress('IR')).toBe(true);
      expect(isIranAddress('Iran, Islamic Republic of')).toBe(true);
      expect(isIranAddress('Islamic Republic of Iran')).toBe(true);
    });

    it('should return false for other countries', () => {
      expect(isIranAddress('United States')).toBe(false);
      expect(isIranAddress('Germany')).toBe(false);
      expect(isIranAddress('France')).toBe(false);
    });
  });

  describe('isStrictIranAddress', () => {
    it('should return false for null, undefined, or empty', () => {
      expect(isStrictIranAddress()).toBe(false);
      expect(isStrictIranAddress(null)).toBe(false);
      expect(isStrictIranAddress('')).toBe(false);
    });

    it('should return true for variations of Iran', () => {
      expect(isStrictIranAddress('Iran')).toBe(true);
      expect(isStrictIranAddress('ایران')).toBe(true);
    });
  });

  describe('formatIranStreet2', () => {
    it('should format pelak and unit properly', () => {
      expect(formatIranStreet2('12', '4')).toBe('پلاک 12، واحد 4');
      expect(formatIranStreet2('۱۲', '۴')).toBe('پلاک ۱۲، واحد ۴');
    });

    it('should handle only pelak', () => {
      expect(formatIranStreet2('12', null)).toBe('پلاک 12');
      expect(formatIranStreet2('12', '')).toBe('پلاک 12');
    });

    it('should handle only unit', () => {
      expect(formatIranStreet2(null, '5')).toBe('واحد 5');
      expect(formatIranStreet2('', '5')).toBe('واحد 5');
    });

    it('should return empty string when both are empty', () => {
      expect(formatIranStreet2(null, null)).toBe('');
      expect(formatIranStreet2('', '')).toBe('');
      expect(formatIranStreet2('  ', '  ')).toBe('');
    });
  });

  describe('parseIranStreet2', () => {
    it('should parse pelak and unit from standard format', () => {
      const result = parseIranStreet2('پلاک 12، واحد 4');
      expect(result).toEqual({ pelak: '12', unit: '4' });
    });

    it('should parse pelak and unit with persian digits', () => {
      const result = parseIranStreet2('پلاک ۱۲، واحد ۴');
      expect(result).toEqual({ pelak: '۱۲', unit: '۴' });
    });

    it('should parse only pelak', () => {
      const result = parseIranStreet2('پلاک 24');
      expect(result).toEqual({ pelak: '24', unit: '' });
    });

    it('should parse only unit', () => {
      const result = parseIranStreet2('واحد 3');
      expect(result).toEqual({ pelak: '', unit: '3' });
    });

    it('should return empty for empty/null string', () => {
      expect(parseIranStreet2(null)).toEqual({ pelak: '', unit: '' });
      expect(parseIranStreet2('')).toEqual({ pelak: '', unit: '' });
    });

    it('should fallback to placing unstructured text in pelak', () => {
      expect(parseIranStreet2('طبقه سوم')).toEqual({
        pelak: 'طبقه سوم',
        unit: '',
      });
    });
  });
});
