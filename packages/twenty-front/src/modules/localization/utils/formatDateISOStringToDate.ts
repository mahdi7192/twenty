import { type DateFormat } from '@/localization/constants/DateFormat';
import { formatPlainDateISOString } from '@/localization/utils/formatPlainDateISOString';
import { type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { formatJalaliFromDate, isDateWithoutTime } from 'twenty-shared/utils';

export const formatDateISOStringToDate = ({
  date,
  timeZone,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  localeCatalog?: Locale;
}) => {
  if (isDateWithoutTime(date)) {
    return formatPlainDateISOString({ date, dateFormat, localeCatalog });
  }

  const isPersianLocale =
    localeCatalog?.code === 'fa-IR' ||
    localeCatalog?.code === 'fa' ||
    (typeof document !== 'undefined' &&
      document.documentElement.lang?.startsWith('fa'));

  if (isPersianLocale) {
    return formatJalaliFromDate(new Date(date));
  }

  return formatInTimeZone(new Date(date), timeZone, dateFormat, {
    locale: localeCatalog,
  });
};
