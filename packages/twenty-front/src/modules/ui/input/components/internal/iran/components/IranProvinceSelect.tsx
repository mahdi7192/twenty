import { useMemo } from 'react';
import { Select } from '@/ui/input/components/Select';
import { SELECT_IRAN_PROVINCE_DROPDOWN_ID } from '@/ui/input/components/internal/iran/constants/SelectIranProvinceDropdownId';
import { IRAN_PROVINCES } from '@/ui/field/input/constants/IranProvinces';
import { IconCircleOff } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';

export type IranProvinceSelectProps = {
  label?: string;
  selectedProvince?: string;
  onChange: (province: string) => void;
  disabled?: boolean;
};

export const IranProvinceSelect = ({
  label = 'استان',
  selectedProvince,
  onChange,
  disabled,
}: IranProvinceSelectProps) => {
  const options: SelectOption<string>[] = useMemo(() => {
    const list = IRAN_PROVINCES.map<SelectOption<string>>((province) => ({
      label: province,
      value: province,
    }));

    return [
      {
        label: 'انتخاب استان',
        value: '',
        Icon: IconCircleOff,
      },
      ...list,
    ];
  }, []);

  return (
    <Select
      fullWidth
      disabled={disabled}
      dropdownId={SELECT_IRAN_PROVINCE_DROPDOWN_ID}
      options={options}
      label={label}
      withSearchInput
      onChange={onChange}
      value={selectedProvince ?? ''}
    />
  );
};
