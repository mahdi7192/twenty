import { styled } from '@linaria/react';
import { lazy, Suspense, useContext, type ComponentType } from 'react';
import type { DatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CalendarStartDay } from 'twenty-shared/constants';

import { detectCalendarStartDay } from '@/localization/utils/detection/detectCalendarStartDay';
import { DatePickerHeader } from '@/ui/input/components/internal/date/components/DatePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import {
  DATE_PICKER_CONTAINER_WIDTH,
  StyledDatePickerContainer,
} from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { getRelativeDatePickerCalendarRange } from '@/ui/input/components/internal/date/utils/getRelativeDatePickerCalendarRange';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { t } from '@lingui/core/macro';
import 'react-datepicker/dist/react-datepicker.css';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { type Nullable } from 'twenty-shared/types';
import {
  getDaysInJalaliMonth,
  gregorianToJalali,
  isDefined,
  jalaliToGregorian,
  turnJSDateToPlainDate,
  turnPlainDateToShiftedDateInSystemTimeZone,
  type RelativeDateFilter,
} from 'twenty-shared/utils';
import { IconCalendarX } from 'twenty-ui/icon';
import { MenuItemLeftContent } from 'twenty-ui/primitives/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export const MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID =
  'date-picker-month-and-year-dropdown-month-select';
export const MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID =
  'date-picker-month-and-year-dropdown-year-select';

const StyledButtonContainer = styled.div`
  align-items: center;
  border-radius: calc(
    ${themeCssVariables.border.radius.md} - ${themeCssVariables.spacing[1]}
  );
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  height: 32px;
  margin: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: auto;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledButtonContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: start;
`;

const StyledDatePickerFallback = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 300px;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
  width: 280px;
`;

type DatePickerProps = {
  instanceId: string;
  isRelative?: boolean;
  hideHeaderInput?: boolean;
  plainDateString: Nullable<string>;
  relativeDate?: RelativeDateFilter & {
    start: string;
    end: string;
  };
  onClose?: (date: string | null) => void;
  onChange?: (date: string | null) => void;
  onRelativeDateChange?: (
    relativeDateFilter: RelativeDateFilter | null,
  ) => void;
  clearable?: boolean;
  onEnter?: (date: string | null) => void;
  onEscape?: (date: string | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
  hideCalendar?: boolean;
};

// react-datepicker v9 types its props as a discriminated union keyed on
// selectsRange/selectsMultiple. We drive selectsRange dynamically (relative
// filters highlight a contiguous range), which TS cannot narrow to a single
// union branch, so collapse the discriminants to plain optionals.
type DatePickerPropsType = Omit<
  ReactDatePickerLibProps,
  'selectsRange' | 'selectsMultiple' | 'onChange' | 'formatMultipleDates'
> & {
  selectsRange?: boolean;
  onChange?: (date: Date | null) => void;
};

const ReactDatePicker = lazy<ComponentType<DatePickerPropsType>>(() =>
  import('react-datepicker').then((mod) => ({
    // react-datepicker ships CJS; under vite 8 this dynamic import's `default`
    // can be the module namespace ({ default: Component }) rather than the
    // component itself, so unwrap a nested default when present.
    default: ((mod.default as any)?.default ??
      mod.default) as unknown as ComponentType<DatePickerPropsType>,
  })),
);

export const DatePicker = ({
  instanceId,
  plainDateString,
  onChange,
  onClose,
  clearable = true,
  onClear,
  isRelative,
  relativeDate,
  onRelativeDateChange,
  hideHeaderInput,
}: DatePickerProps) => {
  const { theme } = useContext(ThemeContext);
  const plainDate = isDefined(plainDateString)
    ? Temporal.PlainDate.from(plainDateString)
    : Temporal.Now.plainDateISO();

  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;

  const relativeRangeStartPlainDate = isDefined(relativeRangeStart)
    ? Temporal.PlainDate.from(relativeRangeStart)
    : null;

  const relativeRangeEndPlainDate = isDefined(relativeRangeEnd)
    ? Temporal.PlainDate.from(relativeRangeEnd).subtract({ days: 1 })
    : null;

  const {
    startDate: relativeRangeStartDate,
    endDate: relativeRangeEndDate,
    rangeKey: relativeDateRangeKey,
  } = getRelativeDatePickerCalendarRange(
    relativeRangeStartPlainDate,
    relativeRangeEndPlainDate,
  );

  const { closeDropdown: closeDropdownMonthSelect } = useCloseDropdown();
  const { closeDropdown: closeDropdownYearSelect } = useCloseDropdown();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const handleClear = () => {
    closeDropdowns();
    onClear?.();
  };

  const closeDropdowns = () => {
    closeDropdownYearSelect(MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID);
    closeDropdownMonthSelect(MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID);
  };

  const handleClose = (newDate: string) => {
    closeDropdowns();
    onClose?.(newDate);
  };

  const isPersianLocale =
    currentWorkspaceMember?.locale?.startsWith('fa') ||
    (typeof document !== 'undefined' &&
      (document.documentElement.lang?.startsWith('fa') ||
        document.documentElement.dir === 'rtl'));

  const handleChangeMonth = (month: number) => {
    if (isPersianLocale && isDefined(plainDate)) {
      const currentJalali = gregorianToJalali(
        plainDate.year,
        plainDate.month,
        plainDate.day,
      );
      const maxDays = getDaysInJalaliMonth(currentJalali.jalaliYear, month);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(currentJalali.jalaliYear, month, safeDay);
      const newDate = Temporal.PlainDate.from({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newDate.toString());
      return;
    }
    const newDate = plainDate?.with({ month: month });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleAddMonth = () => {
    if (isPersianLocale && isDefined(plainDate)) {
      const currentJalali = gregorianToJalali(
        plainDate.year,
        plainDate.month,
        plainDate.day,
      );
      let nextMonth = currentJalali.jalaliMonth + 1;
      let nextYear = currentJalali.jalaliYear;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }
      const maxDays = getDaysInJalaliMonth(nextYear, nextMonth);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(nextYear, nextMonth, safeDay);
      const newDate = Temporal.PlainDate.from({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newDate.toString());
      return;
    }
    const newDate = plainDate?.add({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleSubtractMonth = () => {
    if (isPersianLocale && isDefined(plainDate)) {
      const currentJalali = gregorianToJalali(
        plainDate.year,
        plainDate.month,
        plainDate.day,
      );
      let prevMonth = currentJalali.jalaliMonth - 1;
      let prevYear = currentJalali.jalaliYear;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const maxDays = getDaysInJalaliMonth(prevYear, prevMonth);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(prevYear, prevMonth, safeDay);
      const newDate = Temporal.PlainDate.from({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newDate.toString());
      return;
    }
    const newDate = plainDate?.subtract({ months: 1 });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleChangeYear = (year: number) => {
    if (isPersianLocale && isDefined(plainDate)) {
      const currentJalali = gregorianToJalali(
        plainDate.year,
        plainDate.month,
        plainDate.day,
      );
      const maxDays = getDaysInJalaliMonth(year, currentJalali.jalaliMonth);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(year, currentJalali.jalaliMonth, safeDay);
      const newDate = Temporal.PlainDate.from({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newDate.toString());
      return;
    }
    const newDate = plainDate?.with({ year: year });

    onChange?.(newDate?.toString() ?? null);
  };

  const handleDateChange = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    onChange?.(plainDatePicked.toString());
  };

  const handleDateSelect = (datePicked: Date | null) => {
    if (!isDefined(datePicked)) {
      return;
    }
    const plainDatePicked = turnJSDateToPlainDate(datePicked);

    handleClose?.(plainDatePicked.toString());
  };

  const calendarStartDay = isPersianLocale
    ? 6
    : currentWorkspaceMember?.calendarStartDay === CalendarStartDay.SYSTEM
      ? CalendarStartDay[detectCalendarStartDay()]
      : (currentWorkspaceMember?.calendarStartDay ?? undefined);

  const dateForDatePicker =
    turnPlainDateToShiftedDateInSystemTimeZone(plainDate);

  return (
    <StyledDatePickerContainer calendarDisabled={isRelative}>
      <div className={clearable ? 'clearable ' : ''}>
        <Suspense
          fallback={
            <StyledDatePickerFallback>
              <SkeletonTheme
                baseColor={theme.background.tertiary}
                highlightColor={theme.background.transparent.lighter}
                borderRadius={2}
              >
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
                <Skeleton
                  width={DATE_PICKER_CONTAINER_WIDTH - 16}
                  height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                />
              </SkeletonTheme>
            </StyledDatePickerFallback>
          }
        >
          <ReactDatePicker
            key={relativeDateRangeKey}
            open={true}
            disabledKeyboardNavigation
            onChange={handleDateChange}
            onSelect={handleDateSelect}
            openToDate={isRelative ? relativeRangeStartDate : dateForDatePicker}
            selectsRange={isRelative ? true : undefined}
            startDate={isRelative ? relativeRangeStartDate : undefined}
            endDate={isRelative ? relativeRangeEndDate : undefined}
            selected={isRelative ? undefined : dateForDatePicker}
            calendarStartDay={
              calendarStartDay as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
            }
            formatWeekDay={
              isPersianLocale
                ? (dayName: string) => {
                    const persianDayMap: Record<string, string> = {
                      Saturday: 'ش',
                      Sunday: 'ی',
                      Monday: 'د',
                      Tuesday: 'س',
                      Wednesday: 'چ',
                      Thursday: 'پ',
                      Friday: 'ج',
                      Sat: 'ش',
                      Sun: 'ی',
                      Mon: 'د',
                      Tue: 'س',
                      Wed: 'چ',
                      Thu: 'پ',
                      Fri: 'ج',
                    };
                    return persianDayMap[dayName] ?? dayName.charAt(0);
                  }
                : undefined
            }
            renderDayContents={(dayOfMonth: number, date?: Date) => {
              if (isPersianLocale && date) {
                const jalali = gregorianToJalali(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  date.getDate(),
                );
                return jalali.jalaliDay;
              }
              return dayOfMonth;
            }}
            renderCustomHeader={({
              monthDate,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) =>
              isRelative ? (
                <RelativeDatePickerHeader
                  instanceId={instanceId}
                  direction={relativeDate?.direction ?? 'PAST'}
                  amount={relativeDate?.amount}
                  unit={relativeDate?.unit ?? 'DAY'}
                  onChange={onRelativeDateChange}
                  calendarMonthDate={monthDate}
                  onPreviousMonth={decreaseMonth}
                  onNextMonth={increaseMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                />
              ) : (
                <DatePickerHeader
                  date={plainDate?.toString() ?? null}
                  onChange={onChange}
                  onChangeMonth={handleChangeMonth}
                  onChangeYear={handleChangeYear}
                  onAddMonth={handleAddMonth}
                  onSubtractMonth={handleSubtractMonth}
                  prevMonthButtonDisabled={prevMonthButtonDisabled}
                  nextMonthButtonDisabled={nextMonthButtonDisabled}
                  hideInput={hideHeaderInput}
                />
              )
            }
          />
        </Suspense>
      </div>
      {clearable && (
        <StyledButtonContainer onClick={handleClear}>
          <StyledButtonContent>
            <MenuItemLeftContent LeftIcon={IconCalendarX} text={t`Clear`} />
          </StyledButtonContent>
        </StyledButtonContainer>
      )}
    </StyledDatePickerContainer>
  );
};
