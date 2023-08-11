import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PasswordsPlatform from '../passwords-platform';
import { APIProvider } from '@deriv/api';
import { mockStore, StoreProvider } from '@deriv/stores';
import userEvent from '@testing-library/user-event';

describe('<PasswordsPlatform />', () => {
    const mock_props = {
        email: 'test@demo.com',
        has_dxtrade_accounts: false,
        has_mt5_accounts: true,
    };

    let modal_root_el: HTMLDivElement;

    beforeAll(() => {
        modal_root_el = document.createElement('div');
        modal_root_el.setAttribute('id', 'modal_root');
        document.body.appendChild(modal_root_el);
    });

    afterAll(() => {
        document.body.removeChild(modal_root_el);
    });

    const store = mockStore({});

    const renderComponent = ({ props = mock_props, store_config = store }) =>
        render(
            <StoreProvider store={store_config}>
                <APIProvider>
                    <PasswordsPlatform {...props} />
                </APIProvider>
            </StoreProvider>
        );

    it('should render DX password section when platform is MT5', async () => {
        renderComponent({});

        expect(screen.getByText('Deriv MT5 Password')).toBeInTheDocument();
    });

    it('should render DX password section when platform is DerivX', async () => {
        const new_props = {
            ...mock_props,
            has_dxtrade_accounts: true,
            has_mt5_accounts: false,
        };
        renderComponent({ props: new_props });

        expect(screen.getByText('Deriv X Password')).toBeInTheDocument();
    });

    it('should open Send email modal when Change password button is clicked', async () => {
        renderComponent({});

        userEvent.click(screen.getByRole('button', { name: /change password/i }));
        let el_modal;
        await waitFor(() => {
            el_modal = screen.getByText('We’ve sent you an email');
        });
        expect(el_modal).toBeInTheDocument();
    });
});
