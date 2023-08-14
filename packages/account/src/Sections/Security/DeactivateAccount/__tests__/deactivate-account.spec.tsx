import React from 'react';
import { render, screen } from '@testing-library/react';
import DeactivateAccount from '../deactivate-account';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Redirect: jest.fn(() => <div>Redirected to ClosingAccount</div>),
}));

describe('DeactivateAccount', () => {
    it('should render the component', () => {
        render(<DeactivateAccount />);
        expect(screen.getByText('Redirected to ClosingAccount')).toBeInTheDocument();
    });
});
