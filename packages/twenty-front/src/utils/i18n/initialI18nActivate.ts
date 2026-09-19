import { fromNavigator, fromStorage, fromUrl } from '@lingui/detect-locale';
import { APP_LOCALES, getLocaleTextDirection } from 'twenty-shared/translations';
import { isDefined, isValidLocale, normalizeLocale } from 'twenty-shared/utils';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

export const initialI18nActivate = () => {
  const urlLocale = fromUrl('locale');
  const storageLocale = fromStorage('locale');
  const navigatorLocale = fromNavigator();

  let locale: keyof typeof APP_LOCALES = APP_LOCALES['fa-IR'];

  const normalizedUrlLocale = isDefined(urlLocale)
    ? normalizeLocale(urlLocale)
    : null;
  const normalizedStorageLocale = isDefined(storageLocale)
    ? normalizeLocale(storageLocale)
    : null;

  if (isDefined(normalizedUrlLocale) && isValidLocale(normalizedUrlLocale)) {
    locale = normalizedUrlLocale;
    try {
      localStorage.setItem('locale', normalizedUrlLocale);
    } catch (error) {
      // oxlint-disable-next-line no-console
      console.log('Failed to save locale to localStorage:', error);
    }
  } else if (
    isDefined(normalizedStorageLocale) &&
    isValidLocale(normalizedStorageLocale)
  ) {
    locale = normalizedStorageLocale;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleTextDirection(locale);
  }

  dynamicActivate(locale);
};

