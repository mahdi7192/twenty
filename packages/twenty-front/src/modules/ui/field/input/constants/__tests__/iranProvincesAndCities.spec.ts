import { IRAN_PROVINCES } from '@/ui/field/input/constants/IranProvinces';
import { IRAN_PROVINCES_AND_CITIES } from '@/ui/field/input/constants/IranProvincesAndCities';
import { getCitiesForProvince } from '@/ui/field/input/utils/getCitiesForProvince';

describe('iranProvincesAndCities', () => {
  it('should contain all 31 Iranian provinces', () => {
    expect(IRAN_PROVINCES.length).toBe(31);
    expect(Object.keys(IRAN_PROVINCES_AND_CITIES).length).toBe(31);
  });

  it('should contain major provinces', () => {
    expect(IRAN_PROVINCES).toContain('تهران');
    expect(IRAN_PROVINCES).toContain('اصفهان');
    expect(IRAN_PROVINCES).toContain('فارس');
    expect(IRAN_PROVINCES).toContain('خراسان رضوی');
    expect(IRAN_PROVINCES).toContain('آذربایجان شرقی');
    expect(IRAN_PROVINCES).toContain('مازندران');
    expect(IRAN_PROVINCES).toContain('خوزستان');
  });

  it('should return cities for a given province', () => {
    const tehranCities = getCitiesForProvince('تهران');
    expect(tehranCities).toContain('تهران');
    expect(tehranCities).toContain('شهریار');
    expect(tehranCities).toContain('اسلامشهر');

    const farsCities = getCitiesForProvince('فارس');
    expect(farsCities).toContain('شیراز');
    expect(farsCities).toContain('مرودشت');
  });

  it('should return empty array for empty or unknown province', () => {
    expect(getCitiesForProvince(null)).toEqual([]);
    expect(getCitiesForProvince('')).toEqual([]);
    expect(getCitiesForProvince('استان ناشناخته')).toEqual([]);
  });
});
