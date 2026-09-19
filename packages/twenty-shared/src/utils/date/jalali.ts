export type JalaliDate = {
  jalaliYear: number;
  jalaliMonth: number;
  jalaliDay: number;
};

export type GregorianDate = {
  gregorianYear: number;
  gregorianMonth: number;
  gregorianDay: number;
};

export const JALALI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const;

export const JALALI_WEEKDAY_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
] as const;

export const isJalaliLeapYear = (jalaliYear: number): boolean => {
  const mod = jalaliYear % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(mod);
};

export const getDaysInJalaliMonth = (
  jalaliYear: number,
  jalaliMonth: number,
): number => {
  if (jalaliMonth >= 1 && jalaliMonth <= 6) {
    return 31;
  }
  if (jalaliMonth >= 7 && jalaliMonth <= 11) {
    return 30;
  }
  if (jalaliMonth === 12) {
    return isJalaliLeapYear(jalaliYear) ? 30 : 29;
  }
  return 30;
};

export const gregorianToJalali = (
  gregorianYear: number,
  gregorianMonth: number,
  gregorianDay: number,
): JalaliDate => {
  const gregorianDaysInMonths = [
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
  ];
  let normalizedGregorianYear = gregorianYear <= 1600 ? 0 : 979;
  let calculationYear =
    gregorianYear - (gregorianYear <= 1600 ? 621 : 1600);

  const adjustedYear =
    gregorianMonth > 2 ? calculationYear + 1 : calculationYear;

  let elapsedDays =
    365 * calculationYear +
    Math.floor((adjustedYear + 3) / 4) -
    Math.floor((adjustedYear + 99) / 100) +
    Math.floor((adjustedYear + 399) / 400) -
    80 +
    gregorianDay +
    gregorianDaysInMonths[gregorianMonth - 1];

  normalizedGregorianYear += 33 * Math.floor(elapsedDays / 12053);
  elapsedDays %= 12053;

  normalizedGregorianYear += 4 * Math.floor(elapsedDays / 1461);
  elapsedDays %= 1461;

  if (elapsedDays > 365) {
    normalizedGregorianYear += Math.floor((elapsedDays - 1) / 365);
    elapsedDays = (elapsedDays - 1) % 365;
  }

  const jalaliMonth =
    elapsedDays < 186
      ? 1 + Math.floor(elapsedDays / 31)
      : 7 + Math.floor((elapsedDays - 186) / 30);

  const jalaliDay =
    1 +
    (elapsedDays < 186 ? elapsedDays % 31 : (elapsedDays - 186) % 30);

  return {
    jalaliYear: normalizedGregorianYear,
    jalaliMonth,
    jalaliDay,
  };
};

export const jalaliToGregorian = (
  jalaliYear: number,
  jalaliMonth: number,
  jalaliDay: number,
): GregorianDate => {
  let baseGregorianYear = jalaliYear <= 979 ? 621 : 1600;
  const normalizedJalaliYear =
    jalaliYear - (jalaliYear <= 979 ? 0 : 979);

  let elapsedDays =
    365 * normalizedJalaliYear +
    Math.floor(normalizedJalaliYear / 33) * 8 +
    Math.floor(((normalizedJalaliYear % 33) + 3) / 4) +
    78 +
    jalaliDay +
    (jalaliMonth < 7
      ? (jalaliMonth - 1) * 31
      : (jalaliMonth - 7) * 30 + 186);

  baseGregorianYear += 400 * Math.floor(elapsedDays / 146097);
  elapsedDays %= 146097;

  if (elapsedDays > 36524) {
    baseGregorianYear += 100 * Math.floor(--elapsedDays / 36524);
    elapsedDays %= 36524;
    if (elapsedDays >= 365) {
      elapsedDays++;
    }
  }

  baseGregorianYear += 4 * Math.floor(elapsedDays / 1461);
  elapsedDays %= 1461;

  if (elapsedDays > 365) {
    baseGregorianYear += Math.floor((elapsedDays - 1) / 365);
    elapsedDays = (elapsedDays - 1) % 365;
  }

  const isLeapGregorianYear =
    (baseGregorianYear % 4 === 0 && baseGregorianYear % 100 !== 0) ||
    baseGregorianYear % 400 === 0;

  const gregorianDaysInMonths = [
    0,
    31,
    isLeapGregorianYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  let gregorianMonth = 0;
  while (
    gregorianMonth < 13 &&
    elapsedDays >= gregorianDaysInMonths[gregorianMonth]
  ) {
    elapsedDays -= gregorianDaysInMonths[gregorianMonth];
    gregorianMonth++;
  }

  return {
    gregorianYear: baseGregorianYear,
    gregorianMonth,
    gregorianDay: elapsedDays + 1,
  };
};

export const formatJalaliFromDate = (
  date: Date,
  formatPattern: 'YYYY/MM/DD' | 'YYYY-MM-DD' | 'D MMMM YYYY' = 'YYYY/MM/DD',
): string => {
  const { jalaliYear, jalaliMonth, jalaliDay } = gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  const paddedMonth = String(jalaliMonth).padStart(2, '0');
  const paddedDay = String(jalaliDay).padStart(2, '0');

  switch (formatPattern) {
    case 'YYYY-MM-DD':
      return `${jalaliYear}-${paddedMonth}-${paddedDay}`;
    case 'D MMMM YYYY':
      return `${jalaliDay} ${JALALI_MONTH_NAMES[jalaliMonth - 1]} ${jalaliYear}`;
    case 'YYYY/MM/DD':
    default:
      return `${jalaliYear}/${paddedMonth}/${paddedDay}`;
  }
};
