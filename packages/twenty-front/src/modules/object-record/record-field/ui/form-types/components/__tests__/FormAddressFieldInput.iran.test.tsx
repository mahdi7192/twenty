import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useState, type ReactNode } from 'react';

import { FormAddressFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAddressFieldInput';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock(
  '@/object-record/record-field/ui/form-types/components/FormTextFieldInput',
  () => ({
    FormTextFieldInput: ({
      label,
      defaultValue,
      onChange,
      placeholder,
    }: any) => (
      <div>
        <label htmlFor={label}>{label}</label>
        <input
          id={label}
          data-testid={label}
          placeholder={placeholder}
          value={defaultValue ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
  }),
);

const renderFormAddressFieldInput = () => {
  const onChange = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({});

  const Component = () => {
    const [value, setValue] = useState<any>(null);
    return (
      <FormAddressFieldInput
        label="آدرس شرکت"
        defaultValue={value}
        onChange={(newValue) => {
          setValue(newValue);
          onChange(newValue);
        }}
      />
    );
  };

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <BaseWrapper>{children}</BaseWrapper>
    </I18nProvider>
  );

  render(<Component />, { wrapper: Wrapper });

  return { onChange };
};

describe('FormAddressFieldInput Iran mode', () => {
  it('renders Iranian inputs by default when country is not set', () => {
    renderFormAddressFieldInput();

    expect(screen.getByText('استان')).toBeInTheDocument();
    expect(screen.getByText('شهر')).toBeInTheDocument();
    expect(screen.getByText('آدرس')).toBeInTheDocument();
    expect(screen.getByText('پلاک')).toBeInTheDocument();
    expect(screen.getByText('واحد')).toBeInTheDocument();
    expect(screen.getByText('کد پستی')).toBeInTheDocument();
    expect(screen.getByText('کشور')).toBeInTheDocument();
  });

  it('updates pelak and unit into addressStreet2 in form mode', async () => {
    const user = userEvent.setup();
    const { onChange } = renderFormAddressFieldInput();

    const pelakInput = screen.getByTestId('پلاک');
    await user.type(pelakInput, '10');

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        addressStreet2: 'پلاک 10',
        addressCountry: 'Iran',
      }),
    );
  });
});
