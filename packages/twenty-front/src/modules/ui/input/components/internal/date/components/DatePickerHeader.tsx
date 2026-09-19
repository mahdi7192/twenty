import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { Select } from '@/ui/input/components/Select';

import { DatePickerInput } from '@/ui/input/components/internal/date/components/DatePickerInput';
import { getMonthSelectOptions } from '@/ui/input/components/internal/date/utils/getMonthSelectOptions';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { IconChevronLeft, IconChevronRight } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { gregorianToJalali, isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';
const YEARS_SELECT_OPTIONS = Array.from(
  { length: 200 },
  (_, i) => new Date().getFullYear() + 50 - i,
).map((year) => ({ label: year.toString(), value: year }));

const currentJalaliYear = gregorianToJalali(
  new Date().getFullYear(),
  1,
  1,
).jalaliYear;

const JALALI_YEARS_SELECT_OPTIONS = Array.from(
  { length: 150 },
  (_, i) => currentJalaliYear + 20 - i,
).map((year) => ({ label: year.toString(), value: year }));

const StyledCustomDatePickerHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};

  padding-top: ${themeCssVariables.spacing[2]};
`;

type DatePickerHeaderProps = {
  date: string | null;
  onChange?: (date: string | null) => void;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  onAddMonth: () => void;
  onSubtractMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
  hideInput?: boolean;
};

export const DatePickerHeader = ({
  date,
  onChange,
  onChangeMonth,
  onChangeYear,
  onAddMonth,
  onSubtractMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
  hideInput = false,
}: DatePickerHeaderProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;
  const isPersian =
    userLocale.startsWith('fa') ||
    (typeof document !== 'undefined' &&
      (document.documentElement.lang?.startsWith('fa') ||
        document.documentElement.dir === 'rtl'));

  const now = Temporal.Now.plainDateISO();
  const dateParsed = isDefined(date) ? Temporal.PlainDate.from(date) : now;
  const jalali = isPersian
    ? gregorianToJalali(dateParsed.year, dateParsed.month, dateParsed.day)
    : null;

  const currentMonthValue = isPersian ? jalali?.jalaliMonth : dateParsed.month;
  const currentYearValue = isPersian ? jalali?.jalaliYear : dateParsed.year;
  const yearOptions = isPersian
    ? JALALI_YEARS_SELECT_OPTIONS
    : YEARS_SELECT_OPTIONS;

  return (
    <>
      {!hideInput && <DatePickerInput date={date} onChange={onChange} />}
      <StyledCustomDatePickerHeader>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
          }}
        >
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID}
            options={getMonthSelectOptions(isPersian ? 'fa-IR' : userLocale)}
            onChange={onChangeMonth}
            value={currentMonthValue}
            fullWidth
          />
        </ClickOutsideListenerContext.Provider>
        <ClickOutsideListenerContext.Provider
          value={{
            excludedClickOutsideId: MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
          }}
        >
          <Select
            dropdownId={MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID}
            onChange={onChangeYear}
            value={currentYearValue}
            options={yearOptions}
            fullWidth
          />
        </ClickOutsideListenerContext.Provider>
        <LightIconButton
          onClick={onSubtractMonth}
          size="md"
          disabled={prevMonthButtonDisabled}
          aria-label={t`Previous`}
        >
          <IconChevronLeft />
        </LightIconButton>
        <LightIconButton
          onClick={onAddMonth}
          size="md"
          disabled={nextMonthButtonDisabled}
          aria-label={t`Next`}
        >
          <IconChevronRight />
        </LightIconButton>
      </StyledCustomDatePickerHeader>
    </>
  );
};
