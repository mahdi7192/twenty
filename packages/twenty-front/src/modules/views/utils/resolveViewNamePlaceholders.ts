import {
  buildObjectMetadataLabelPlaceholderValues,
  interpolateMessagePlaceholders,
} from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';

const VIEW_NAME_TRANSLATIONS: Record<string, string> = {
  'By Stage': 'بر اساس مرحله',
  'By Status': 'بر اساس وضعیت',
  'Default View': 'نمای پیش‌فرض',
  'Assigned to Me': 'تخصیص‌داده‌شده به من',
  Versions: 'نسخه‌ها',
  Runs: 'اجراها',
  'List Members Table': 'جدول اعضای لیست',
  All: 'همه',
};

const OBJECT_NAME_TRANSLATIONS: Record<string, string> = {
  Opportunity: 'فرصت فروش',
  Opportunities: 'فرصت‌های فروش',
  Company: 'شرکت',
  Companies: 'شرکت‌ها',
  Person: 'مخاطب',
  People: 'مخاطبین',
  Task: 'کار',
  Tasks: 'کارها',
  Note: 'یادداشت',
  Notes: 'یادداشت‌ها',
  Workflow: 'جریان کار',
  Workflows: 'جریان‌های کار',
  Message: 'پیام',
  Messages: 'پیام‌ها',
  Dashboard: 'داشبورد',
  Dashboards: 'داشبوردها',
  Campaign: 'کمپین',
  Campaigns: 'کمپین‌ها',
  List: 'لیست',
  Lists: 'لیست‌ها',
};

export const resolveViewNamePlaceholders = (
  viewName: string | undefined,
  objectMetadataItem: FlatObjectMetadataItem | undefined,
): string => {
  if (!isDefined(viewName)) {
    return '';
  }

  const isRtl =
    typeof document !== 'undefined' &&
    (document.documentElement.dir === 'rtl' ||
      document.documentElement.lang?.startsWith('fa') ||
      (typeof window !== 'undefined' &&
        window.localStorage?.getItem('locale') === 'fa-IR'));

  let name = viewName;
  if (isRtl) {
    const trimmed = name.trim();
    if (VIEW_NAME_TRANSLATIONS[trimmed]) {
      name = VIEW_NAME_TRANSLATIONS[trimmed];
    } else if (/^All\s+\{objectLabelPlural\}/i.test(trimmed)) {
      name = trimmed.replace(
        /^All\s+\{objectLabelPlural\}/i,
        'همه {objectLabelPlural}',
      );
    } else if (/^All\s+/i.test(trimmed)) {
      const remainder = trimmed.replace(/^All\s+/i, '');
      const translatedRemainder =
        OBJECT_NAME_TRANSLATIONS[remainder] ?? remainder;
      name = `همه ${translatedRemainder}`;
    }
  }

  if (!isDefined(objectMetadataItem)) {
    return name;
  }

  const placeholderValues =
    buildObjectMetadataLabelPlaceholderValues(objectMetadataItem);

  if (isRtl) {
    if (
      placeholderValues.objectLabelPlural &&
      OBJECT_NAME_TRANSLATIONS[placeholderValues.objectLabelPlural]
    ) {
      placeholderValues.objectLabelPlural =
        OBJECT_NAME_TRANSLATIONS[placeholderValues.objectLabelPlural];
    }
    if (
      placeholderValues.objectLabelSingular &&
      OBJECT_NAME_TRANSLATIONS[placeholderValues.objectLabelSingular]
    ) {
      placeholderValues.objectLabelSingular =
        OBJECT_NAME_TRANSLATIONS[placeholderValues.objectLabelSingular];
    }
  }

  return interpolateMessagePlaceholders(name, placeholderValues);
};

