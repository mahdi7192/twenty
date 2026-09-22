import { type FieldAddressValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isStrictIranAddress } from '@/ui/field/input/utils/iranAddressUtils';
import { isNonEmptyString } from '@sniptt/guards';
import {
  ALLOWED_ADDRESS_SUBFIELDS,
  type AllowedAddressSubField,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { joinAddressFieldValues } from '~/utils/joinAddressFieldValues';

export const formatAddressDisplay = (
  fieldValue: FieldAddressValue | undefined,
  subFields: AllowedAddressSubField[] | null | undefined,
) => {
  if (!isDefined(fieldValue)) return '';
  const fieldsToUse =
    subFields && subFields.length > 0
      ? subFields
      : [...ALLOWED_ADDRESS_SUBFIELDS];

  if (isStrictIranAddress(fieldValue.addressCountry)) {
    const isFieldAllowed = (field: AllowedAddressSubField) =>
      fieldsToUse.includes(field);

    const parts: string[] = [];

    if (
      isFieldAllowed('addressCountry') &&
      isNonEmptyString(fieldValue.addressCountry)
    ) {
      parts.push(
        fieldValue.addressCountry === 'Iran'
          ? 'ایران'
          : fieldValue.addressCountry,
      );
    }
    if (
      isFieldAllowed('addressState') &&
      isNonEmptyString(fieldValue.addressState)
    ) {
      parts.push(fieldValue.addressState);
    }
    if (
      isFieldAllowed('addressCity') &&
      isNonEmptyString(fieldValue.addressCity)
    ) {
      parts.push(fieldValue.addressCity);
    }
    if (
      isFieldAllowed('addressStreet1') &&
      isNonEmptyString(fieldValue.addressStreet1)
    ) {
      parts.push(fieldValue.addressStreet1);
    }
    if (
      isFieldAllowed('addressStreet2') &&
      isNonEmptyString(fieldValue.addressStreet2)
    ) {
      parts.push(fieldValue.addressStreet2);
    }
    if (
      isFieldAllowed('addressPostcode') &&
      isNonEmptyString(fieldValue.addressPostcode)
    ) {
      parts.push(`کد پستی: ${fieldValue.addressPostcode}`);
    }

    if (parts.length > 0) {
      return parts.join('، ');
    }
  }

  return joinAddressFieldValues(fieldValue, fieldsToUse);
};
