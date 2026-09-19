import { type DateFormat } from '@/localization/constants/DateFormat';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { isValid, type Locale } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { formatJalaliFromDate } from 'twenty-shared/utils';

export const formatDateISOStringToDateTime = ({
  date,
  timeZone,
  dateFormat,
  timeFormat,
  localeCatalog,
}: {
  date: string;
  timeZone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  localeCatalog: Locale;
}) => {
  const parsedDate = new Date(date);

  if (!isValid(parsedDate)) {
    return '';
  }

  const isPersianLocale =
    localeCatalog?.code === 'fa-IR' ||
    localeCatalog?.code === 'fa' ||
    (typeof document !== 'undefined' &&
      document.documentElement.lang?.startsWith('fa'));

  if (isPersianLocale) {
    const formattedDate = formatJalaliFromDate(parsedDate);
    const formattedTime = formatInTimeZone(parsedDate, timeZone, timeFormat, {
      locale: localeCatalog,
    });
    return `${formattedDate} ${formattedTime}`;
  }

  return formatInTimeZone(parsedDate, timeZone, `${dateFormat} ${timeFormat}`, {
    locale: localeCatalog,
  });
};
