import { format, type Locale } from 'date-fns';
import { Temporal } from 'temporal-polyfill';
import { formatJalaliFromDate } from 'twenty-shared/utils';

export const formatPlainDateISOString = ({
  date,
  dateFormat,
  localeCatalog,
}: {
  date: string;
  dateFormat: string;
  localeCatalog?: Locale;
}) => {
  const plainDate = Temporal.PlainDate.from(date);
  const isPersianLocale =
    localeCatalog?.code === 'fa-IR' ||
    localeCatalog?.code === 'fa' ||
    (typeof document !== 'undefined' &&
      document.documentElement.lang?.startsWith('fa'));

  if (isPersianLocale) {
    return formatJalaliFromDate(
      new Date(plainDate.year, plainDate.month - 1, plainDate.day),
    );
  }

  return format(
    new Date(plainDate.year, plainDate.month - 1, plainDate.day),
    dateFormat,
    { locale: localeCatalog },
  );
};
