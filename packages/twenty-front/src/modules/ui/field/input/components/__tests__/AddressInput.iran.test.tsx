import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';

import { AddressInput } from '@/ui/field/input/components/AddressInput';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const renderAddressInput = (initialValue?: any) => {
  const onChange = jest.fn();
  const onClickOutside = jest.fn();
  const BaseWrapper = getJestMetadataAndApolloMocksWrapper({});

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <I18nProvider i18n={i18n}>
      <BaseWrapper>{children}</BaseWrapper>
    </I18nProvider>
  );

  const value = initialValue ?? {
    addressStreet1: '',
    addressStreet2: null,
    addressCity: null,
    addressState: null,
    addressCountry: 'Iran',
    addressPostcode: null,
    addressLat: null,
    addressLng: null,
  };

  render(
    <AddressInput
      instanceId="address-input"
      value={value}
      onTab={jest.fn()}
      onShiftTab={jest.fn()}
      onEnter={jest.fn()}
      onEscape={jest.fn()}
      onClickOutside={onClickOutside}
      onChange={onChange}
    />,
    { wrapper: Wrapper },
  );

  return { onChange, onClickOutside };
};

describe('AddressInput Iran mode', () => {
  it('renders Iranian fields by default', () => {
    renderAddressInput();

    expect(screen.getByText('استان')).toBeInTheDocument();
    expect(screen.getByText('شهر')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('خیابان، کوچه، معبر...'),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('پلاک')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('واحد')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('کد پستی')).toBeInTheDocument();
    expect(screen.getByText('Iran')).toBeInTheDocument();
  });

  it('updates pelak and unit and formats into addressStreet2', async () => {
    const user = userEvent.setup();
    const { onChange } = renderAddressInput();

    const pelakInput = screen.getByPlaceholderText('پلاک');
    await user.type(pelakInput, '24');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet2: 'پلاک 24',
      }),
    );

    const unitInput = screen.getByPlaceholderText('واحد');
    await user.type(unitInput, '5');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet2: 'پلاک 24، واحد 5',
      }),
    );
  });

  it('updates address street and postcode', async () => {
    const user = userEvent.setup();
    const { onChange } = renderAddressInput();

    const streetInput = screen.getByPlaceholderText('خیابان، کوچه، معبر...');
    await user.type(streetInput, 'ولیعصر');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressStreet1: 'ولیعصر',
      }),
    );

    const postcodeInput = screen.getByPlaceholderText('کد پستی');
    await user.type(postcodeInput, '1987654321');

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        addressPostcode: '1987654321',
      }),
    );
  });
});
