import React from 'react';
import { act, fireEvent, screen, render, waitFor } from '@testing-library/react';
import { useUpdatingAvailableBalance } from 'Components/hooks';
import { useStores } from 'Stores';
import { isMobile } from '@deriv/shared';
import CreateAdForm from '../create-ad-form.jsx';

const mocked_general_store = {
    client: {
        currency: 'USD',
        local_currency_config: {},
    },
    setP2PConfig: jest.fn(),
};

const mocked_my_ads_store = {
    advert_details: {
        is_visible: false,
    },
    default_advert_description: '',
    contact_info: 1,
    restrictLength: jest.fn(),
    setApiErrorMessage: jest.fn(),
    setIsAdCreatedModalVisible: jest.fn(),
    setIsAdExceedsDailyLimitModalOpen: jest.fn(),
    setShowAdForm: jest.fn(),
    restrictDecimalPlace: jest.fn(),
};

const mocked_floating_rate_store = {
    rate_type: '',
    exchange_rate: '',
    float_rate_offset_limit: '',
    setApiErrorMessage: jest.fn(),
    setExchangeRate: jest.fn(),
};

const mocked_my_profile_store = {
    getAdvertiserPaymentMethods: jest.fn(),
    getPaymentMethodsList: jest.fn(),
    payment_methods_list: [],
};

const getFormFields = rate_type => ({
    offer_amount: screen.queryByTestId('offer_amount'),
    rate_type: screen.queryByTestId(rate_type),
    min_transaction: screen.queryByTestId('min_transaction'),
    max_transaction: screen.queryByTestId('max_transaction'),
    contact_info: screen.queryByTestId('contact_info'),
    default_advert_description: screen.queryByTestId('default_advert_description'),
});

jest.mock('Stores', () => ({
    ...jest.requireActual('Stores'),
    useStores: jest.fn(() => ({
        my_ads_store: mocked_my_ads_store,
        my_profile_store: mocked_my_profile_store,
        general_store: mocked_general_store,
        floating_rate_store: mocked_floating_rate_store,
    })),
}));

jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Loading: () => <div>Loading</div>,
    Div100vhContainer: ({ children }) => (
        <div>
            Div100vhContainer
            <div>{children}</div>
        </div>
    ),
}));

jest.mock('Components/hooks', () => ({
    ...jest.requireActual('Components/hooks'),
    useUpdatingAvailableBalance: jest.fn(),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    isMobile: jest.fn(() => false),
}));

const modal_root_el = document.createElement('div');

describe('<CreateAdForm />', () => {
    beforeAll(() => {
        modal_root_el.setAttribute('id', 'modal_root');
        document.body.appendChild(modal_root_el);
    });
    afterAll(() => {
        document.body.removeChild(modal_root_el);
    });

    it('Component should be rendered', () => {
        render(<CreateAdForm />);

        const el_dp2p_create_ad_form_container = screen.getByTestId('dp2p-create-ad-form_container');
        expect(el_dp2p_create_ad_form_container).toBeInTheDocument();
    });

    it('inputs must be checked for changes after making changes in each input', () => {
        render(<CreateAdForm />);

        const el_dp2p_create_ad_form__inputs = screen.getAllByRole('textbox');
        el_dp2p_create_ad_form__inputs.map(input => fireEvent.change(input, { target: { value: 123 } }));
        expect(mocked_my_ads_store.restrictLength).toHaveBeenCalled();
    });

    it('should hide the form after clicking `Cancel` button', () => {
        render(<CreateAdForm />);

        const el_dp2p_create_ad_form_cancel_button = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(el_dp2p_create_ad_form_cancel_button);
        expect(mocked_my_ads_store.setShowAdForm).toHaveBeenCalledWith(false);
    });

    it('checkbox must be unchecked after toggle checkbox', () => {
        useStores.mockImplementation(() => ({
            my_ads_store: { ...mocked_my_ads_store, is_ad_created_modal_visible: true },
            my_profile_store: mocked_my_profile_store,
            general_store: mocked_general_store,
            floating_rate_store: mocked_floating_rate_store,
        }));
        render(<CreateAdForm />);

        const el_dp2p_create_ad_form_checkbox = screen.getByRole('checkbox');

        fireEvent.click(el_dp2p_create_ad_form_checkbox);
        expect(el_dp2p_create_ad_form_checkbox).toBeChecked(false);
    });

    it('should hide the modal after clicking `Ok` button', () => {
        useStores.mockImplementation(() => ({
            my_ads_store: { ...mocked_my_ads_store, is_ad_created_modal_visible: true },
            my_profile_store: mocked_my_profile_store,
            general_store: mocked_general_store,
            floating_rate_store: mocked_floating_rate_store,
        }));
        render(<CreateAdForm />);

        const el_dp2p_create_ad_form_confirm_button = screen.getByRole('button', { name: 'Ok' });
        fireEvent.click(el_dp2p_create_ad_form_confirm_button);

        expect(mocked_my_ads_store.setIsAdCreatedModalVisible).toHaveBeenCalledWith(false);
    });

    it('should disable button when form contains invalid data', () => {
        useStores.mockImplementation(() => ({
            my_ads_store: { ...mocked_my_ads_store },
            my_profile_store: mocked_my_profile_store,
            general_store: mocked_general_store,
            floating_rate_store: { ...mocked_floating_rate_store, rate_type: 'float' },
        }));
        render(<CreateAdForm />);

        expect(screen.getByTestId('float_rate_type')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post ad' })).toBeDisabled();
    });

    it('should set default rate type as +0.01 for sell ad', async () => {
        render(<CreateAdForm />);
        const el_sell_ad = screen.getByRole('radio', { name: 'Sell USD' });
        act(() => {
            fireEvent.click(el_sell_ad);
        });
        await waitFor(() => {
            expect(useUpdatingAvailableBalance).toHaveBeenCalled();
            expect(screen.getByTestId('float_rate_type')).toHaveDisplayValue('+0.01');
        });
    });

    it('should set default rate type as -0.01 for buy ad', async () => {
        render(<CreateAdForm />);
        const el_buy_ad = screen.getByRole('radio', { name: 'Buy USD' });
        act(() => {
            fireEvent.click(el_buy_ad);
        });
        await waitFor(() => {
            expect(screen.getByTestId('float_rate_type')).toHaveDisplayValue('-0.01');
        });
    });

    it('should restrict decimal to 2 places for rate field', async () => {
        const { my_ads_store } = useStores();
        render(<CreateAdForm />);
        const { rate_type } = getFormFields('float_rate_type');

        act(() => {
            fireEvent.change(rate_type, { target: { value: '4' } });
        });
        await waitFor(() => {
            expect(my_ads_store.restrictDecimalPlace).toHaveBeenCalled();
        });
    });

    it('should render the component in mobile view', () => {
        isMobile.mockReturnValue(true);
        render(<CreateAdForm />);

        expect(screen.getByText('Div100vhContainer')).toBeInTheDocument();
    });
});
