import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  convertFirstDayOfTheWeekToCalendarStartDayNumber,
  getDaysInJalaliMonth,
  gregorianToJalali,
  isDefined,
  isSubDayRelativeDateFilterUnit,
  jalaliToGregorian,
  type RelativeDateFilter,
} from 'twenty-shared/utils';

import {
  DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID,
  DateTimePickerHeader,
} from '@/ui/input/components/internal/date/components/DateTimePickerHeader';
import { RelativeDatePickerHeader } from '@/ui/input/components/internal/date/components/RelativeDatePickerHeader';
import { RelativeDateTimeRangeText } from '@/ui/input/components/internal/date/components/RelativeDateTimeRangeText';
import { StyledDatePickerContainer } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { getRelativeDatePickerCalendarRange } from '@/ui/input/components/internal/date/utils/getRelativeDatePickerCalendarRange';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { lazy, Suspense, useContext, type ComponentType } from 'react';
import type { DatePickerProps as ReactDatePickerLibProps } from 'react-datepicker';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import 'react-datepicker/dist/react-datepicker.css';

import { IconCalendarX } from 'twenty-ui/icon';
import { MenuItemLeftContent } from 'twenty-ui/primitives/navigation';

import { useGetShiftedDateToSystemTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToSystemTimeZone';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { Temporal } from 'temporal-polyfill';

export {
  MONTH_AND_YEAR_DROPDOWN_MONTH_SELECT_ID,
  MONTH_AND_YEAR_DROPDOWN_YEAR_SELECT_ID,
} from '@/ui/input/components/internal/date/components/DatePicker';
export { DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID } from '@/ui/input/components/internal/date/components/DateTimePickerHeader';

import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOuterWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: row;
  position: relative;
  width: 280px;
`;

const StyledSeparator = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  width: 100%;
`;

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

type DateTimePickerProps = {
  instanceId: string;
  isRelative?: boolean;
  hideHeaderInput?: boolean;
  date: Temporal.ZonedDateTime | null;
  relativeDate?: RelativeDateFilter & {
    start: Temporal.ZonedDateTime;
    end?: Temporal.ZonedDateTime;
  };
  onClose?: (date: Temporal.ZonedDateTime | null) => void;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  onRelativeDateChange?: (
    relativeDateFilter: RelativeDateFilter | null,
  ) => void;
  clearable?: boolean;
  onEnter?: (date: Temporal.ZonedDateTime | null) => void;
  onEscape?: (date: Temporal.ZonedDateTime | null) => void;
  keyboardEventsDisabled?: boolean;
  onClear?: () => void;
  timeZone?: string;
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

export const DateTimePicker = ({
  instanceId,
  date,
  onChange,
  onClose,
  clearable = true,
  onClear,
  isRelative,
  relativeDate,
  onRelativeDateChange,
  hideHeaderInput,
  timeZone,
}: DateTimePickerProps) => {
  const { theme } = useContext(ThemeContext);
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();

  const { userTimezone } = useUserTimezone();

  const dateToUse =
    date ?? Temporal.Now.zonedDateTimeISO(timeZone ?? userTimezone);

  const { closeDropdown: closeMonthYearPanel } = useCloseDropdown();

  const { getShiftedDateToSystemTimeZone } =
    useGetShiftedDateToSystemTimeZone();

  const getZonedDateTimeFromDatePicked = (datePicked: Date) => {
    const plainDatePart = Temporal.PlainDate.from({
      day: datePicked.getDate(),
      month: datePicked.getMonth() + 1,
      year: datePicked.getFullYear(),
    });

    const zonedDateTime = plainDatePart
      .toZonedDateTime(timeZone ?? userTimezone)
      .with({
        hour: dateToUse?.hour ?? 0,
        minute: dateToUse?.minute ?? 0,
      });

    return { zonedDateTime };
  };

  const handleClear = () => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
    onClear?.();
  };

  const handleClose = (newDate: Temporal.ZonedDateTime) => {
    closeMonthYearPanel(DATE_TIME_PICKER_MONTH_YEAR_PANEL_DROPDOWN_ID);
    onClose?.(newDate);
  };

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isPersianLocale =
    currentWorkspaceMember?.locale?.startsWith('fa') ||
    (typeof document !== 'undefined' &&
      (document.documentElement.lang?.startsWith('fa') ||
        document.documentElement.dir === 'rtl'));

  const handleChangeMonth = (month: number) => {
    if (isPersianLocale && isDefined(dateToUse)) {
      const currentJalali = gregorianToJalali(
        dateToUse.year,
        dateToUse.month,
        dateToUse.day,
      );
      const maxDays = getDaysInJalaliMonth(currentJalali.jalaliYear, month);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(currentJalali.jalaliYear, month, safeDay);
      const newZonedDateTime = dateToUse.with({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newZonedDateTime);
      return;
    }
    const newZonedDateTime = dateToUse?.with({ month: month }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleAddMonth = () => {
    if (isPersianLocale && isDefined(dateToUse)) {
      const currentJalali = gregorianToJalali(
        dateToUse.year,
        dateToUse.month,
        dateToUse.day,
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
      const newZonedDateTime = dateToUse.with({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newZonedDateTime);
      return;
    }
    const newZonedDateTime = dateToUse?.add({ months: 1 }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleSubtractMonth = () => {
    if (isPersianLocale && isDefined(dateToUse)) {
      const currentJalali = gregorianToJalali(
        dateToUse.year,
        dateToUse.month,
        dateToUse.day,
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
      const newZonedDateTime = dateToUse.with({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newZonedDateTime);
      return;
    }
    const newZonedDateTime = dateToUse?.subtract({ months: 1 }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleChangeYear = (year: number) => {
    if (isPersianLocale && isDefined(dateToUse)) {
      const currentJalali = gregorianToJalali(
        dateToUse.year,
        dateToUse.month,
        dateToUse.day,
      );
      const maxDays = getDaysInJalaliMonth(year, currentJalali.jalaliMonth);
      const safeDay = Math.min(currentJalali.jalaliDay, maxDays);
      const { gregorianYear, gregorianMonth, gregorianDay } =
        jalaliToGregorian(year, currentJalali.jalaliMonth, safeDay);
      const newZonedDateTime = dateToUse.with({
        year: gregorianYear,
        month: gregorianMonth,
        day: gregorianDay,
      });
      onChange?.(newZonedDateTime);
      return;
    }
    const newZonedDateTime = dateToUse?.with({ year: year }) ?? null;

    onChange?.(newZonedDateTime);
  };

  const handleDateChange = (newDate: Date | null) => {
    if (!isDefined(newDate)) {
      return;
    }
    const { zonedDateTime } = getZonedDateTimeFromDatePicked(newDate);

    onChange?.(zonedDateTime);
  };

  const handleDateSelect = (newDate: Date | null) => {
    if (!isDefined(newDate)) {
      return;
    }
    const { zonedDateTime } = getZonedDateTimeFromDatePicked(newDate);

    handleClose?.(zonedDateTime);
  };

  const relativeUnit = relativeDate?.unit ?? 'DAY';
  const relativeRangeStart = isRelative ? relativeDate?.start : undefined;
  const relativeRangeEnd = isRelative ? relativeDate?.end : undefined;

  const isSubDayRelativeUnit =
    isRelative === true && isSubDayRelativeDateFilterUnit(relativeUnit);

  const relativeRangeStartPlainDate = isDefined(relativeRangeStart)
    ? relativeRangeStart.toPlainDate()
    : null;

  const relativeRangeEndPlainDate = isDefined(relativeRangeEnd)
    ? relativeRangeEnd.subtract({ nanoseconds: 1 }).toPlainDate()
    : null;

  const {
    startDate: relativeRangeStartDate,
    endDate: relativeRangeEndDate,
    rangeKey: relativeDateRangeKey,
  } = getRelativeDatePickerCalendarRange(
    relativeRangeStartPlainDate,
    relativeRangeEndPlainDate,
  );

  const nonShiftedDateForReactDatePicker = new Date(
    dateToUse.toInstant().toString(),
  );

  const shiftedDateForReactDatePicker = getShiftedDateToSystemTimeZone(
    nonShiftedDateForReactDatePicker,
    timeZone ?? userTimezone,
  );

  const calendarStartDayNumber = isPersianLocale
    ? 6
    : convertFirstDayOfTheWeekToCalendarStartDayNumber(userFirstDayOfTheWeek);

  return (
    <StyledOuterWrapper>
      <StyledDatePickerContainer
        calendarDisabled={isRelative && !isSubDayRelativeUnit}
      >
        {isSubDayRelativeUnit ? (
          <>
            <RelativeDatePickerHeader
              instanceId={instanceId}
              direction={relativeDate?.direction ?? 'PAST'}
              amount={relativeDate?.amount}
              unit={relativeUnit}
              onChange={onRelativeDateChange}
              allowIntraDayUnits={true}
            />
            {isDefined(relativeRangeStart) && isDefined(relativeRangeEnd) && (
              <RelativeDateTimeRangeText
                start={relativeRangeStart}
                end={relativeRangeEnd}
              />
            )}
          </>
        ) : (
          <Suspense
            fallback={
              <StyledDatePickerFallback>
                <SkeletonTheme
                  baseColor={theme.background.tertiary}
                  highlightColor={theme.background.transparent.lighter}
                  borderRadius={4}
                >
                  <Skeleton
                    width={200}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                  />
                  <Skeleton
                    width={240}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
                  />
                  <Skeleton
                    width={220}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                  />
                  <Skeleton
                    width={180}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
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
              openToDate={
                isRelative
                  ? relativeRangeStartDate
                  : shiftedDateForReactDatePicker
              }
              selectsRange={isRelative ? true : undefined}
              startDate={isRelative ? relativeRangeStartDate : undefined}
              endDate={isRelative ? relativeRangeEndDate : undefined}
              selected={isRelative ? undefined : shiftedDateForReactDatePicker}
              calendarStartDay={
                calendarStartDayNumber as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined
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
                    unit={relativeUnit}
                    onChange={onRelativeDateChange}
                    allowIntraDayUnits={true}
                    calendarMonthDate={monthDate}
                    onPreviousMonth={decreaseMonth}
                    onNextMonth={increaseMonth}
                    prevMonthButtonDisabled={prevMonthButtonDisabled}
                    nextMonthButtonDisabled={nextMonthButtonDisabled}
                  />
                ) : (
                  <DateTimePickerHeader
                    date={dateToUse}
                    onChange={onChange}
                    onAddMonth={handleAddMonth}
                    onSubtractMonth={handleSubtractMonth}
                    prevMonthButtonDisabled={prevMonthButtonDisabled}
                    nextMonthButtonDisabled={nextMonthButtonDisabled}
                    hideInput={hideHeaderInput}
                    onChangeMonth={handleChangeMonth}
                    onChangeYear={handleChangeYear}
                  />
                )
              }
            />
          </Suspense>
        )}
        {clearable && (
          <>
            <StyledSeparator />
            <StyledButtonContainer onClick={handleClear}>
              <StyledButtonContent>
                <MenuItemLeftContent LeftIcon={IconCalendarX} text={t`Clear`} />
              </StyledButtonContent>
            </StyledButtonContainer>
          </>
        )}
      </StyledDatePickerContainer>
    </StyledOuterWrapper>
  );
};
