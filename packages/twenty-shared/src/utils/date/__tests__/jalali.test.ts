import {
  formatJalaliFromDate,
  getDaysInJalaliMonth,
  gregorianToJalali,
  isJalaliLeapYear,
  jalaliToGregorian,
  JALALI_MONTH_NAMES,
} from '@/utils/date/jalali';

describe('jalali calendar utilities', () => {
  it('converts Gregorian dates to Jalali accurately', () => {
    // 2026-09-19 -> 1405-06-28
    const { jalaliYear, jalaliMonth, jalaliDay } = gregorianToJalali(2026, 9, 19);
    expect(jalaliYear).toBe(1405);
    expect(jalaliMonth).toBe(6);
    expect(jalaliDay).toBe(28);

    // Nowruz 2026-03-21 -> 1405-01-01
    const nowruz = gregorianToJalali(2026, 3, 21);
    expect(nowruz).toEqual({
      jalaliYear: 1405,
      jalaliMonth: 1,
      jalaliDay: 1,
    });
  });

  it('converts Jalali dates back to Gregorian accurately', () => {
    const { gregorianYear, gregorianMonth, gregorianDay } = jalaliToGregorian(
      1405,
      6,
      28,
    );
    expect(gregorianYear).toBe(2026);
    expect(gregorianMonth).toBe(9);
    expect(gregorianDay).toBe(19);

    const nowruzGregorian = jalaliToGregorian(1405, 1, 1);
    expect(nowruzGregorian).toEqual({
      gregorianYear: 2026,
      gregorianMonth: 3,
      gregorianDay: 21,
    });
  });

  it('calculates days in Jalali months', () => {
    expect(getDaysInJalaliMonth(1405, 1)).toBe(31);
    expect(getDaysInJalaliMonth(1405, 6)).toBe(31);
    expect(getDaysInJalaliMonth(1405, 7)).toBe(30);
    expect(getDaysInJalaliMonth(1405, 11)).toBe(30);
    expect(getDaysInJalaliMonth(1405, 12)).toBe(29);
  });

  it('detects leap years correctly', () => {
    expect(isJalaliLeapYear(1403)).toBe(true);
    expect(isJalaliLeapYear(1404)).toBe(false);
    expect(isJalaliLeapYear(1408)).toBe(true);
  });

  it('formats dates in Jalali with English digits', () => {
    const date = new Date(2026, 8, 19);
    expect(formatJalaliFromDate(date, 'YYYY/MM/DD')).toBe('1405/06/28');
    expect(formatJalaliFromDate(date, 'YYYY-MM-DD')).toBe('1405-06-28');
    expect(formatJalaliFromDate(date, 'D MMMM YYYY')).toBe(
      `28 ${JALALI_MONTH_NAMES[5]} 1405`,
    );
  });
});
