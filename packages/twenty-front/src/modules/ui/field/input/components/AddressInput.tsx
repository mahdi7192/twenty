import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PlaceAutocompleteSelect } from '@/geo-map/components/PlaceAutocompleteSelect';
import { SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID } from '@/geo-map/constants/SelectAutocompleteListDropDownId';
import { useRegisterInputEvents } from '@/object-record/record-field/ui/meta-types/input/hooks/useRegisterInputEvents';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TextInput } from '@/ui/input/components/TextInput';
import { TEXT_INPUT_CLICK_OUTSIDE_ID } from '@/ui/input/components/constants/TextInputClickOutsideId';
import { CountrySelect } from '@/ui/input/components/internal/country/components/CountrySelect';
import { SELECT_COUNTRY_DROPDOWN_ID } from '@/ui/input/components/internal/country/constants/SelectCountryDropdownId';
import { IranCitySelect } from '@/ui/input/components/internal/iran/components/IranCitySelect';
import { IranProvinceSelect } from '@/ui/input/components/internal/iran/components/IranProvinceSelect';
import { SELECT_IRAN_CITY_DROPDOWN_ID } from '@/ui/input/components/internal/iran/constants/SelectIranCityDropdownId';
import { SELECT_IRAN_PROVINCE_DROPDOWN_ID } from '@/ui/input/components/internal/iran/constants/SelectIranProvinceDropdownId';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { activeDropdownFocusIdState } from '@/ui/layout/dropdown/states/activeDropdownFocusIdState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme-constants';

import { t } from '@lingui/core/macro';
import { type AllowedAddressSubField } from 'twenty-shared/types';
import { getCitiesForProvince } from '@/ui/field/input/utils/getCitiesForProvince';
import { useAddressAutocomplete } from '@/ui/field/input/hooks/useAddressAutocomplete';
import { useCountryUtils } from '@/ui/field/input/hooks/useCountryUtils';
import { useFocusManagement } from '@/ui/field/input/hooks/useFocusManagement';
import {
  formatIranStreet2,
  isIranAddress,
  parseIranStreet2,
} from '@/ui/field/input/utils/iranAddressUtils';

const StyledAddressContainer = styled.div`
  padding: 4px 8px;

  width: 344px;
  > div {
    margin-bottom: 6px;
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: auto;
    min-width: 100px;
    max-width: 200px;
    overflow: hidden;
    > div {
      margin-bottom: 8px;
    }
  }
`;

const StyledHalfRowContainer = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: block;
    > div {
      margin-bottom: 7px;
    }
  }
`;

const StyledInputWithDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export type AddressInputProps = {
  instanceId: string;
  value: FieldAddressValue;
  onTab: (newAddress: FieldAddressDraftValue) => void;
  onShiftTab: (newAddress: FieldAddressDraftValue) => void;
  onEnter: (newAddress: FieldAddressDraftValue) => void;
  onEscape: (newAddress: FieldAddressDraftValue) => void;
  onClickOutside: (
    event: MouseEvent | TouchEvent,
    newAddress: FieldAddressDraftValue,
  ) => void;
  clearable?: boolean;
  onChange?: (updatedValue: FieldAddressDraftValue) => void;
  subFields?: AllowedAddressSubField[] | null;
};

export const AddressInput = ({
  instanceId,
  value,
  onTab,
  onShiftTab,
  onEnter,
  onEscape,
  onClickOutside,
  onChange,
  subFields,
}: AddressInputProps) => {
  const [internalValue, setInternalValue] = useState<FieldAddressValue>(() => ({
    ...value,
    addressCountry: value.addressCountry || 'Iran',
  }));

  const isCurrentAddressIran = isIranAddress(internalValue.addressCountry);

  const addressStreet1InputRef = useRef<HTMLInputElement>(null);
  const addressStreet2InputRef = useRef<HTMLInputElement>(null);
  const addressCityInputRef = useRef<HTMLInputElement>(null);
  const addressStateInputRef = useRef<HTMLInputElement>(null);
  const addressPostcodeInputRef = useRef<HTMLInputElement>(null);
  const pelakInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const parsedStreet2 = useMemo(
    () => parseIranStreet2(internalValue.addressStreet2),
    [internalValue.addressStreet2],
  );
  const [pelak, setPelak] = useState(parsedStreet2.pelak);
  const [unit, setUnit] = useState(parsedStreet2.unit);

  useEffect(() => {
    const parsed = parseIranStreet2(internalValue.addressStreet2);
    setPelak(parsed.pelak);
    setUnit(parsed.unit);
  }, [internalValue.addressStreet2]);

  const inputRefs = useMemo(
    () => ({
      addressStreet1: addressStreet1InputRef,
      addressStreet2: isCurrentAddressIran
        ? pelakInputRef
        : addressStreet2InputRef,
      addressCity: addressCityInputRef,
      addressState: addressStateInputRef,
      addressPostcode: addressPostcodeInputRef,
    }),
    [isCurrentAddressIran],
  );

  const { findCountryCodeByCountryName } = useCountryUtils();

  const {
    placeAutocompleteData,
    tokenForPlaceApi,
    typeOfAddressForAutocomplete,
    setTypeOfAddressForAutocomplete,
    getAutocompletePlaceData,
    autoFillInputsFromPlaceDetails,
    closeDropdownOfAutocomplete,
  } = useAddressAutocomplete(onChange);

  const isFieldInputInSubFieldsAddress = useCallback(
    (field: AllowedAddressSubField): boolean => {
      if (isDefined(subFields)) {
        return subFields.includes(field);
      }
      return true;
    },
    [subFields],
  );

  const { getFocusHandler, handleTab, handleShiftTab } = useFocusManagement(
    inputRefs,
    internalValue,
    onTab,
    onShiftTab,
  );

  const getChangeHandler = useCallback(
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      if (isDefined(subFields) && !subFields.includes(field)) {
        return;
      }
      const updatedAddress = { ...internalValue, [field]: updatedAddressPart };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);

      if (
        !isCurrentAddressIran &&
        (field === 'addressStreet1' || field === 'addressCity')
      ) {
        const countryCode = findCountryCodeByCountryName(
          updatedAddress.addressCountry ?? '',
        );
        if (field !== typeOfAddressForAutocomplete) {
          setTypeOfAddressForAutocomplete(field);
        }
        const isFieldCity = field === 'addressCity';
        getAutocompletePlaceData({
          address: updatedAddressPart,
          country: countryCode,
          isFieldCity,
        });
      }
    },
    [
      internalValue,
      isCurrentAddressIran,
      onChange,
      findCountryCodeByCountryName,
      typeOfAddressForAutocomplete,
      setTypeOfAddressForAutocomplete,
      getAutocompletePlaceData,
      subFields,
    ],
  );

  const handlePelakChange = useCallback(
    (newPelak: string) => {
      setPelak(newPelak);
      const newStreet2 = formatIranStreet2(newPelak, unit);
      const updatedAddress = {
        ...internalValue,
        addressStreet2: newStreet2,
      };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    },
    [internalValue, unit, onChange],
  );

  const handleUnitChange = useCallback(
    (newUnit: string) => {
      setUnit(newUnit);
      const newStreet2 = formatIranStreet2(pelak, newUnit);
      const updatedAddress = {
        ...internalValue,
        addressStreet2: newStreet2,
      };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    },
    [internalValue, pelak, onChange],
  );

  const handleProvinceChange = useCallback(
    (newProvince: string) => {
      const validCities = getCitiesForProvince(newProvince);
      const shouldKeepCity =
        Boolean(internalValue.addressCity) &&
        validCities.includes(internalValue.addressCity ?? '');

      const updatedAddress = {
        ...internalValue,
        addressState: newProvince,
        addressCity: shouldKeepCity ? internalValue.addressCity : '',
      };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    },
    [internalValue, onChange],
  );

  const handleCityChange = useCallback(
    (newCity: string) => {
      const updatedAddress = {
        ...internalValue,
        addressCity: newCity,
      };
      setInternalValue(updatedAddress);
      onChange?.(updatedAddress);
    },
    [internalValue, onChange],
  );

  const handlePlaceSelection = useCallback(
    (placeId: string) => {
      const placeAutocomplete = placeAutocompleteData?.find(
        (place) => place.placeId === placeId,
      );
      const token = tokenForPlaceApi ?? '';
      if (!isDefined(placeAutocomplete)) return;

      const text: string | undefined =
        typeOfAddressForAutocomplete !== 'addressCity'
          ? placeAutocomplete.text
          : undefined;

      autoFillInputsFromPlaceDetails(placeId, token, text, internalValue);
    },
    [
      placeAutocompleteData,
      tokenForPlaceApi,
      typeOfAddressForAutocomplete,
      autoFillInputsFromPlaceDetails,
      internalValue,
    ],
  );

  const handleClickOutside = useCallback(() => {
    closeDropdownOfAutocomplete();
  }, [closeDropdownOfAutocomplete]);

  const handleEnter = useCallback(() => {
    onEnter(internalValue);
    closeDropdownOfAutocomplete();
  }, [onEnter, internalValue, closeDropdownOfAutocomplete]);

  const handleEscape = useCallback(() => {
    onEscape(internalValue);
    closeDropdownOfAutocomplete();
  }, [onEscape, internalValue, closeDropdownOfAutocomplete]);

  const handleOutsideClick = useCallback(
    (event: MouseEvent | TouchEvent) => {
      onClickOutside?.(event, internalValue);
      closeDropdownOfAutocomplete();
    },
    [onClickOutside, internalValue, closeDropdownOfAutocomplete],
  );

  useRegisterInputEvents({
    focusId: instanceId,
    inputRef: wrapperRef,
    inputValue: internalValue,
    onEnter: handleEnter,
    onEscape: handleEscape,
    onTab: handleTab,
    onShiftTab: handleShiftTab,
  });

  const activeDropdownFocusId = useAtomStateValue(activeDropdownFocusIdState);

  useListenClickOutside({
    refs: [wrapperRef],
    callback: (event) => {
      if (
        activeDropdownFocusId === SELECT_COUNTRY_DROPDOWN_ID ||
        activeDropdownFocusId === SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID ||
        activeDropdownFocusId === SELECT_IRAN_PROVINCE_DROPDOWN_ID ||
        activeDropdownFocusId === SELECT_IRAN_CITY_DROPDOWN_ID
      ) {
        return;
      }

      event.stopImmediatePropagation();
      handleOutsideClick(event);
    },
    enabled: isDefined(onClickOutside),
    listenerId: 'address-input',
  });

  useEffect(() => {
    setInternalValue({
      ...value,
      addressCountry: value?.addressCountry || 'Iran',
    });
  }, [value]);

  const validAutocompleteData = useMemo(
    () =>
      isNonEmptyArray(placeAutocompleteData) ? placeAutocompleteData : null,
    [placeAutocompleteData],
  );

  const renderInputWithAutocomplete = (
    inputElement: React.ReactNode | null,
    fieldType: 'addressStreet1' | 'addressCity',
  ) => {
    const shouldShowDropdown =
      validAutocompleteData && typeOfAddressForAutocomplete === fieldType;

    if (!shouldShowDropdown) {
      return inputElement;
    }

    return (
      <StyledInputWithDropdownContainer>
        <Dropdown
          dropdownId={SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID}
          dropdownPlacement="bottom-start"
          excludedClickOutsideIds={[
            TEXT_INPUT_CLICK_OUTSIDE_ID,
            SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID,
          ]}
          disableClickForClickableComponent={true}
          onClickOutside={handleClickOutside}
          clickableComponent={inputElement}
          dropdownComponents={
            <PlaceAutocompleteSelect
              list={validAutocompleteData}
              onChange={handlePlaceSelection}
              dropdownId={SELECT_AUTOCOMPLETE_LIST_DROPDOWN_ID}
            />
          }
        />
      </StyledInputWithDropdownContainer>
    );
  };

  return (
    <StyledAddressContainer ref={wrapperRef}>
      {isCurrentAddressIran ? (
        <>
          <StyledHalfRowContainer>
            {isFieldInputInSubFieldsAddress('addressState') && (
              <IranProvinceSelect
                label="استان"
                selectedProvince={internalValue.addressState ?? ''}
                onChange={handleProvinceChange}
              />
            )}
            {isFieldInputInSubFieldsAddress('addressCity') && (
              <IranCitySelect
                label="شهر"
                selectedProvince={internalValue.addressState ?? ''}
                selectedCity={internalValue.addressCity ?? ''}
                onChange={handleCityChange}
              />
            )}
          </StyledHalfRowContainer>

          {isFieldInputInSubFieldsAddress('addressStreet1') &&
            renderInputWithAutocomplete(
              <TextInput
                autoFocus
                value={internalValue.addressStreet1 ?? ''}
                ref={inputRefs.addressStreet1}
                label="آدرس"
                placeholder="خیابان، کوچه، معبر..."
                fullWidth
                onChange={getChangeHandler('addressStreet1')}
                onFocus={getFocusHandler('addressStreet1')}
                textClickOutsideId={
                  validAutocompleteData &&
                  typeOfAddressForAutocomplete === 'addressStreet1'
                    ? TEXT_INPUT_CLICK_OUTSIDE_ID
                    : undefined
                }
              />,
              'addressStreet1',
            )}

          {isFieldInputInSubFieldsAddress('addressStreet2') && (
            <StyledHalfRowContainer>
              <TextInput
                value={pelak}
                ref={pelakInputRef}
                label="پلاک"
                placeholder="پلاک"
                fullWidth
                onChange={handlePelakChange}
              />
              <TextInput
                value={unit}
                ref={unitInputRef}
                label="واحد"
                placeholder="واحد"
                fullWidth
                onChange={handleUnitChange}
              />
            </StyledHalfRowContainer>
          )}

          <StyledHalfRowContainer>
            {isFieldInputInSubFieldsAddress('addressPostcode') && (
              <TextInput
                value={internalValue.addressPostcode ?? ''}
                ref={inputRefs.addressPostcode}
                label="کد پستی"
                placeholder="کد پستی"
                fullWidth
                onChange={getChangeHandler('addressPostcode')}
                onFocus={getFocusHandler('addressPostcode')}
              />
            )}
            {isFieldInputInSubFieldsAddress('addressCountry') && (
              <CountrySelect
                label="کشور"
                onChange={getChangeHandler('addressCountry')}
                selectedCountryName={internalValue.addressCountry || 'Iran'}
              />
            )}
          </StyledHalfRowContainer>
        </>
      ) : (
        <>
          {isFieldInputInSubFieldsAddress('addressStreet1') &&
            renderInputWithAutocomplete(
              <TextInput
                autoFocus
                value={internalValue.addressStreet1 ?? ''}
                ref={inputRefs.addressStreet1}
                label={t`Address 1`}
                fullWidth
                onChange={getChangeHandler('addressStreet1')}
                onFocus={getFocusHandler('addressStreet1')}
                textClickOutsideId={
                  validAutocompleteData &&
                  typeOfAddressForAutocomplete === 'addressStreet1'
                    ? TEXT_INPUT_CLICK_OUTSIDE_ID
                    : undefined
                }
              />,
              'addressStreet1',
            )}
          {isFieldInputInSubFieldsAddress('addressStreet2') && (
            <TextInput
              value={internalValue.addressStreet2 ?? ''}
              ref={inputRefs.addressStreet2}
              label={t`Address 2`}
              fullWidth
              onChange={getChangeHandler('addressStreet2')}
              onFocus={getFocusHandler('addressStreet2')}
            />
          )}
          <StyledHalfRowContainer>
            {isFieldInputInSubFieldsAddress('addressCity') &&
              renderInputWithAutocomplete(
                <TextInput
                  value={internalValue.addressCity ?? ''}
                  ref={inputRefs.addressCity}
                  label={t`City`}
                  fullWidth
                  onChange={getChangeHandler('addressCity')}
                  onFocus={getFocusHandler('addressCity')}
                  textClickOutsideId={
                    validAutocompleteData &&
                    typeOfAddressForAutocomplete === 'addressCity'
                      ? TEXT_INPUT_CLICK_OUTSIDE_ID
                      : undefined
                  }
                />,
                'addressCity',
              )}
            {isFieldInputInSubFieldsAddress('addressState') && (
              <TextInput
                value={internalValue.addressState ?? ''}
                ref={inputRefs.addressState}
                label={t`State`}
                fullWidth
                onChange={getChangeHandler('addressState')}
                onFocus={getFocusHandler('addressState')}
              />
            )}
          </StyledHalfRowContainer>
          <StyledHalfRowContainer>
            {isFieldInputInSubFieldsAddress('addressPostcode') && (
              <TextInput
                value={internalValue.addressPostcode ?? ''}
                ref={inputRefs.addressPostcode}
                label={t`Post Code`}
                fullWidth
                onChange={getChangeHandler('addressPostcode')}
                onFocus={getFocusHandler('addressPostcode')}
              />
            )}
            {isFieldInputInSubFieldsAddress('addressCountry') && (
              <CountrySelect
                label={t`Country`}
                onChange={getChangeHandler('addressCountry')}
                selectedCountryName={internalValue.addressCountry ?? ''}
              />
            )}
          </StyledHalfRowContainer>
        </>
      )}
    </StyledAddressContainer>
  );
};
