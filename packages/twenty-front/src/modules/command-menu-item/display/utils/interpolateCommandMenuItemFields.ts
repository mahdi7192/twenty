import { interpolateMessagePlaceholders } from 'twenty-shared/i18n';
import { type CommandMenuContextApi, type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getCommandMenuItemPlaceholderValues } from '@/command-menu-item/utils/getCommandMenuItemPlaceholderValues';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type InterpolatedCommandMenuItemFields = {
  iconKey: Nullable<string>;
  label: string;
  shortLabel: Nullable<string>;
};

const OBJECT_NAME_TRANSLATIONS: Record<string, string> = {
  Attachment: 'پیوست',
  Attachments: 'پیوست‌ها',
  Blocklist: 'لیست مسدود شده',
  Blocklists: 'لیست‌های مسدود شده',
  'Calendar Channel Event Association': 'ارتباط رویداد کانال تقویم',
  'Calendar Channel Event Associations': 'ارتباطات رویداد کانال تقویم',
  'Calendar event participant': 'شرکت‌کننده در رویداد تقویم',
  'Calendar event participants': 'شرکت‌کنندگان در رویداد تقویم',
  'Calendar event': 'رویداد تقویم',
  'Calendar events': 'رویدادهای تقویم',
  'Calendar Event Target': 'هدف رویداد تقویم',
  'Calendar Event Targets': 'اهداف رویداد تقویم',
  'Call Recording': 'ضبط مکالمه',
  'Call Recordings': 'ضبط مکالمات',
  Company: 'شرکت',
  Companies: 'شرکت‌ها',
  Dashboard: 'داشبورد',
  Dashboards: 'داشبوردها',
  Campaign: 'کمپین',
  Campaigns: 'کمپین‌ها',
  List: 'لیست',
  Lists: 'لیست‌ها',
  'List Member': 'عضو لیست',
  'List Members': 'اعضای لیست',
  'Message Channel Message Association': 'ارتباط پیام کانال پیام',
  'Message Channel Message Associations': 'ارتباطات پیام کانال پیام',
  'Message Channel Message Association Message Folder': 'پوشه پیام ارتباط کانال',
  'Message Channel Message Association Message Folders': 'پوشه‌های پیام ارتباط کانال',
  'Message Participant': 'شرکت‌کننده در پیام',
  'Message Participants': 'شرکت‌کنندگان در پیام',
  'Message Thread': 'رشته گفتگو',
  'Message Threads': 'رشته گفتگوها',
  'Message Thread Target': 'هدف رشته گفتگو',
  'Message Thread Targets': 'اهداف رشته گفتگو',
  Message: 'پیام',
  Messages: 'پیام‌ها',
  Note: 'یادداشت',
  Notes: 'یادداشت‌ها',
  'Note Target': 'هدف یادداشت',
  'Note Targets': 'اهداف یادداشت',
  Opportunity: 'فرصت فروش',
  Opportunities: 'فرصت‌های فروش',
  Person: 'مخاطب',
  People: 'مخاطبین',
  'Record share': 'اشتراک‌گذاری رکورد',
  'Record shares': 'اشتراک‌گذاری‌های رکورد',
  Task: 'کار',
  Tasks: 'کارها',
  'Task Target': 'هدف کار',
  'Task Targets': 'اهداف کار',
  'Timeline Activity': 'فعالیت جدول زمانی',
  'Timeline Activities': 'فعالیت‌های جدول زمانی',
  Workflow: 'جریان کار',
  Workflows: 'جریان‌های کار',
  'Workflow Automated Trigger': 'محرک خودکار جریان کار',
  'Workflow Automated Triggers': 'محرک‌های خودکار جریان کار',
  'Workflow Run': 'اجرای جریان کار',
  'Workflow Runs': 'اجراهای جریان کار',
  'Workflow Version': 'نسخه جریان کار',
  'Workflow Versions': 'نسخه‌های جریان کار',
  'Workspace Member': 'عضو فضای کاری',
  'Workspace Members': 'اعضای فضای کاری',
};

export const interpolateCommandMenuItemFields = (
  item: Pick<CommandMenuItemFieldsFragment, 'label' | 'shortLabel' | 'icon'>,
  commandMenuContextApi: CommandMenuContextApi,
): InterpolatedCommandMenuItemFields => {
  const values = getCommandMenuItemPlaceholderValues(commandMenuContextApi);

  const isRtl =
    typeof document !== 'undefined' &&
    (document.documentElement.dir === 'rtl' ||
      document.documentElement.lang?.startsWith('fa') ||
      window?.localStorage?.getItem('locale') === 'fa-IR');

  const normalizeTemplate = (template: string): string => {
    let normalized = template
      .replace(/^جدید\s+\{([^}]+)\}/, '{$1} جدید')
      .replace(/^ایجاد\s+جدید\s+\{([^}]+)\}/, 'ایجاد {$1} جدید');

    if (isRtl) {
      normalized = normalized
        .replace(/^New\s+\{([^}]+)\}/i, '{$1} جدید')
        .replace(/^Create\s+new\s+\{([^}]+)\}/i, 'ایجاد {$1} جدید')
        .replace(/^Create\s+\{([^}]+)\}/i, 'ایجاد {$1}')
        .replace(/^See deleted\s+\{([^}]+)\}/i, 'مشاهده {$1} حذف شده')
        .replace(/^See\s+\{([^}]+)\}/i, 'مشاهده {$1}')
        .replace(/^Go to\s+\{([^}]+)\}/i, 'رفتن به {$1}')
        .replace(/^Send Email$/i, 'ارسال ایمیل')
        .replace(/^Navigate to next\s+\{([^}]+)\}/i, 'رفتن به {$1} بعدی')
        .replace(/^Navigate to previous\s+\{([^}]+)\}/i, 'رفتن به {$1} قبلی')
        .replace(/^Delete\s+\{([^}]+)\}/i, 'حذف {$1}')
        .replace(/^Restore\s+\{([^}]+)\}/i, 'بازیابی {$1}')
        .replace(/^Export\s+\{([^}]+)\}/i, 'خروجی {$1}');
    }

    return normalized;
  };

  const postProcessLocalizedText = (text: string): string => {
    if (!isRtl) {
      return text;
    }

    const settingsTranslations: Record<string, string> = {
      'Settings': 'تنظیمات',
      'Experience Settings': 'تنظیمات ظاهر و تجربه',
      'Accounts Settings': 'تنظیمات حساب‌ها',
      'Emails Settings': 'تنظیمات ایمیل‌ها',
      'Calendars Settings': 'تنظیمات تقویم‌ها',
      'General Settings': 'تنظیمات عمومی',
      'Data Model Settings': 'تنظیمات مدل داده',
      'Members Settings': 'تنظیمات اعضا',
      'Roles Settings': 'تنظیمات نقش‌ها',
      'Domains Settings': 'تنظیمات دامنه‌ها',
      'Billing Settings': 'تنظیمات صورت‌حساب',
      'MCP & APIs Settings': 'تنظیمات MCP و APIها',
      'Apps Settings': 'تنظیمات برنامه‌ها',
      'AI Settings': 'تنظیمات هوش مصنوعی',
      'Security Settings': 'تنظیمات امنیت',
      'Admin Panel Settings': 'تنظیمات پنل مدیریت',
      'Community Settings': 'تنظیمات جامعه کاربری',
      'Developers Settings': 'تنظیمات توسعه‌دهندگان',
      'Profile Settings': 'تنظیمات حساب کاربری',
      'Workspace Settings': 'تنظیمات فضای کاری',
    };

    const goToMatch = text.match(/^Go to\s+(.+)$/i);
    if (goToMatch) {
      const target = goToMatch[1].trim();
      const translatedTarget =
        settingsTranslations[target] ??
        OBJECT_NAME_TRANSLATIONS[target] ??
        target;
      return `رفتن به ${translatedTarget}`;
    }

    if (text.startsWith('رفتن به ')) {
      const target = text.replace(/^رفتن به\s+/, '').trim();
      const translatedTarget =
        settingsTranslations[target] ??
        OBJECT_NAME_TRANSLATIONS[target];
      if (translatedTarget) {
        return `رفتن به ${translatedTarget}`;
      }
      return text;
    }

    const directActionTranslations: Record<string, string> = {
      'Ask AI': 'پرسش از هوش مصنوعی',
      'Send Email': 'ارسال ایمیل',
      'Send email': 'ارسال ایمیل',
      'Compose Email': 'نگارش ایمیل',
      'Quick Lead': 'سرنخ سریع',
      'Create View': 'ایجاد نما',
      'Export View': 'خروجی از نما',
      'Copy link to page': 'کپی پیوند صفحه',
      'Change theme to system': 'تغییر پوسته به سیستم',
      'Change theme to dark': 'تغییر پوسته به تیره',
      'Change theme to light': 'تغییر پوسته به روشن',
      'Close side panel': 'بستن پنل کناری',
      'View Previous AI Chats': 'مشاهده گفتگوهای قبلی هوش مصنوعی',
      'Previous AI Chats': 'گفتگوهای قبلی هوش مصنوعی',
      'See deleted': 'مشاهده حذف شده‌ها',
      'Hide deleted': 'مخفی‌سازی حذف شده‌ها',
      Delete: 'حذف',
      Restore: 'بازیابی',
      Export: 'خروجی',
      Import: 'ورود اطلاعات',
      'Add to Favorites': 'افزودن به علاقه‌مندی‌ها',
      'Remove from Favorites': 'حذف از علاقه‌مندی‌ها',
      'Edit Layout': 'ویرایش چیدمان',
      'By Stage': 'بر اساس مرحله',
      'By Status': 'بر اساس وضعیت',
      'Default View': 'نمای پیش‌فرض',
    };

    if (directActionTranslations[text.trim()]) {
      return directActionTranslations[text.trim()];
    }

    const seeDeletedMatch = text.match(/^See deleted\s+(.+)$/i);
    if (seeDeletedMatch) {
      const target = seeDeletedMatch[1].trim();
      const translatedTarget = OBJECT_NAME_TRANSLATIONS[target] ?? target;
      return `مشاهده ${translatedTarget} حذف شده`;
    }

    const deletedMatch = text.match(/^Deleted\s+(.+)$/i);
    if (deletedMatch) {
      const target = deletedMatch[1].trim();
      const translatedTarget = OBJECT_NAME_TRANSLATIONS[target] ?? target;
      return `${translatedTarget} حذف شده`;
    }

    const hideDeletedMatch = text.match(/^Hide deleted\s+(.+)$/i);
    if (hideDeletedMatch) {
      const target = hideDeletedMatch[1].trim();
      const translatedTarget = OBJECT_NAME_TRANSLATIONS[target] ?? target;
      return `مخفی‌سازی ${translatedTarget} حذف شده`;
    }


    const directTranslation = OBJECT_NAME_TRANSLATIONS[text.trim()];
    if (directTranslation) {
      return directTranslation;
    }

    return text;
  };

  const interpolate = (value: Nullable<string>): Nullable<string> => {
    if (!isDefined(value)) {
      return value;
    }
    const normalized = normalizeTemplate(value);
    const interpolated = interpolateMessagePlaceholders(normalized, values);
    return isDefined(interpolated)
      ? postProcessLocalizedText(interpolated)
      : interpolated;
  };

  return {
    iconKey: interpolate(item.icon),
    label: interpolate(item.label) ?? '',
    shortLabel: interpolate(item.shortLabel),
  };
};
