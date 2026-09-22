import { useMemo } from 'react';
import { FormCountrySelectInput } from '@/object-record/record-field/ui/form-types/components/FormCountrySelectInput';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormNestedFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormNestedFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type VariablePickerComponent } from '@/object-record/record-field/ui/form-types/types/VariablePickerComponent';
import { type FieldAddressDraftValue } from '@/object-record/record-field/ui/types/FieldInputDraftValue';
import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { Field, type SelectOption } from 'twenty-ui/primitives/input';
import { t } from '@lingui/core/macro';
import { IRAN_PROVINCES } from '@/ui/field/input/constants/IranProvinces';
import { getCitiesForProvince } from '@/ui/field/input/utils/getCitiesForProvince';
import {
  formatIranStreet2,
  isIranAddress,
  parseIranStreet2,
} from '@/ui/field/input/utils/iranAddressUtils';
import { normalizeAddressFieldValueForPersist } from '~/utils/normalize-address-field-value-for-persist';

type FormAddressFieldInputProps = {
  label?: string;
  defaultValue?: FieldAddressDraftValue | null;
  onChange: (value: FieldAddressValue) => void;
  VariablePicker?: VariablePickerComponent;
  readonly?: boolean;
};

export const FormAddressFieldInput = ({
  label,
  defaultValue,
  onChange,
  readonly,
  VariablePicker,
}: FormAddressFieldInputProps) => {
  const currentCountry = defaultValue?.addressCountry || 'Iran';
  const isCurrentAddressIran = isIranAddress(currentCountry);

  const { pelak, unit } = useMemo(
    () => parseIranStreet2(defaultValue?.addressStreet2),
    [defaultValue?.addressStreet2],
  );

  const iranProvinceOptions: SelectOption[] = useMemo(
    () =>
      IRAN_PROVINCES.map((province) => ({
        label: province,
        value: province,
      })),
    [],
  );

  const iranCityOptions: SelectOption[] = useMemo(() => {
    const province = defaultValue?.addressState;
    if (!province) return [];
    return getCitiesForProvince(province).map((city) => ({
      label: city,
      value: city,
    }));
  }, [defaultValue?.addressState]);

  const handleChange =
    (field: keyof FieldAddressDraftValue) => (updatedAddressPart: string) => {
      const updatedAddress = {
        addressStreet1: defaultValue?.addressStreet1 ?? '',
        addressStreet2: defaultValue?.addressStreet2 ?? '',
        addressCity: defaultValue?.addressCity ?? '',
        addressState: defaultValue?.addressState ?? '',
        addressPostcode: defaultValue?.addressPostcode ?? '',
        addressCountry: currentCountry,
        addressLat: defaultValue?.addressLat ?? null,
        addressLng: defaultValue?.addressLng ?? null,
        [field]: updatedAddressPart,
      };
      onChange(normalizeAddressFieldValueForPersist(updatedAddress));
    };

  const handleProvinceChange = (newProvince: string | null) => {
    const provinceValue = newProvince ?? '';
    const validCities = getCitiesForProvince(provinceValue);
    const shouldKeepCity =
      Boolean(defaultValue?.addressCity) &&
      validCities.includes(defaultValue?.addressCity ?? '');

    const updatedAddress = {
      addressStreet1: defaultValue?.addressStreet1 ?? '',
      addressStreet2: defaultValue?.addressStreet2 ?? '',
      addressCity: shouldKeepCity ? (defaultValue?.addressCity ?? '') : '',
      addressState: provinceValue,
      addressPostcode: defaultValue?.addressPostcode ?? '',
      addressCountry: currentCountry,
      addressLat: defaultValue?.addressLat ?? null,
      addressLng: defaultValue?.addressLng ?? null,
    };
    onChange(normalizeAddressFieldValueForPersist(updatedAddress));
  };

  const handlePelakChange = (newPelak: string) => {
    const newStreet2 = formatIranStreet2(newPelak, unit);
    handleChange('addressStreet2')(newStreet2);
  };

  const handleUnitChange = (newUnit: string) => {
    const newStreet2 = formatIranStreet2(pelak, newUnit);
    handleChange('addressStreet2')(newStreet2);
  };

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}
      <FormNestedFieldInputContainer>
        {isCurrentAddressIran ? (
          <>
            <FormSelectFieldInput
              label={t`استان`}
              defaultValue={defaultValue?.addressState ?? ''}
              onChange={handleProvinceChange}
              options={iranProvinceOptions}
              readonly={readonly}
              VariablePicker={VariablePicker}
              isNullable
            />
            <FormSelectFieldInput
              label={t`شهر`}
              defaultValue={defaultValue?.addressCity ?? ''}
              onChange={(city) => handleChange('addressCity')(city ?? '')}
              options={iranCityOptions}
              readonly={readonly || !defaultValue?.addressState}
              VariablePicker={VariablePicker}
              isNullable
            />
            <FormTextFieldInput
              label={t`آدرس`}
              defaultValue={defaultValue?.addressStreet1 ?? ''}
              onChange={handleChange('addressStreet1')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`خیابان، کوچه، معبر...`}
            />
            <FormTextFieldInput
              label={t`پلاک`}
              defaultValue={pelak}
              onChange={handlePelakChange}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`پلاک`}
            />
            <FormTextFieldInput
              label={t`واحد`}
              defaultValue={unit}
              onChange={handleUnitChange}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`واحد`}
            />
            <FormTextFieldInput
              label={t`کد پستی`}
              defaultValue={defaultValue?.addressPostcode ?? ''}
              onChange={handleChange('addressPostcode')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`کد پستی`}
            />
            <FormCountrySelectInput
              label={t`کشور`}
              selectedCountryName={currentCountry}
              onChange={handleChange('addressCountry')}
              readonly={readonly}
              VariablePicker={VariablePicker}
            />
          </>
        ) : (
          <>
            <FormTextFieldInput
              label={t`Address 1`}
              defaultValue={defaultValue?.addressStreet1 ?? ''}
              onChange={handleChange('addressStreet1')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`Street address`}
            />
            <FormTextFieldInput
              label={t`Address 2`}
              defaultValue={defaultValue?.addressStreet2 ?? ''}
              onChange={handleChange('addressStreet2')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`Street address 2`}
            />
            <FormTextFieldInput
              label={t`City`}
              defaultValue={defaultValue?.addressCity ?? ''}
              onChange={handleChange('addressCity')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`City`}
            />
            <FormTextFieldInput
              label={t`State`}
              defaultValue={defaultValue?.addressState ?? ''}
              onChange={handleChange('addressState')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`State`}
            />
            <FormTextFieldInput
              label={t`Post Code`}
              defaultValue={defaultValue?.addressPostcode ?? ''}
              onChange={handleChange('addressPostcode')}
              readonly={readonly}
              VariablePicker={VariablePicker}
              placeholder={t`Post Code`}
            />
            <FormCountrySelectInput
              label={t`Country`}
              selectedCountryName={defaultValue?.addressCountry ?? ''}
              onChange={handleChange('addressCountry')}
              readonly={readonly}
              VariablePicker={VariablePicker}
            />
          </>
        )}
      </FormNestedFieldInputContainer>
    </FormFieldInputContainer>
  );
};
