import { useMemo } from 'react';
import { t } from '@lingui/core/macro';
import { Select } from '@/ui/input/components/Select';
import { SELECT_IRAN_CITY_DROPDOWN_ID } from '@/ui/input/components/internal/iran/constants/SelectIranCityDropdownId';
import { getCitiesForProvince } from '@/ui/field/input/utils/getCitiesForProvince';
import { IconCircleOff } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type IranCitySelectProps = {
  label?: string;
  selectedProvince?: string;
  selectedCity?: string;
  onChange: (city: string) => void;
  disabled?: boolean;
};

export const IranCitySelect = ({
  label = t`شهر`,
  selectedProvince,
  selectedCity,
  onChange,
  disabled,
}: IranCitySelectProps) => {
  const cities = useMemo(() => {
    return getCitiesForProvince(selectedProvince);
  }, [selectedProvince]);

  const hasProvince = Boolean(selectedProvince?.trim());

  const options: SelectOption<string>[] = useMemo(() => {
    if (!hasProvince) {
      return [
        {
          label: t`ابتدا استان را انتخاب کنید`,
          value: '',
          Icon: IconCircleOff,
        },
      ];
    }

    const cityOptions = cities.map<SelectOption<string>>((city) => ({
      label: city,
      value: city,
    }));

    return [
      {
        label: t`انتخاب شهر`,
        value: '',
        Icon: IconCircleOff,
      },
      ...cityOptions,
    ];
  }, [cities, hasProvince]);

  return (
    <Select
      fullWidth
      disabled={disabled || !hasProvince}
      dropdownId={SELECT_IRAN_CITY_DROPDOWN_ID}
      options={options}
      label={label}
      withSearchInput
      onChange={onChange}
      value={selectedCity ?? ''}
    />
  );
};
