import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import PercentageSelector from '../percentage-selector';

describe('<PercentageSelector />', () => {
    const getCalculatedAmount = jest.fn();
    const percentage_selector_props = {
        amount: 100,
        currency: 'USD',
        from_account: '',
        getCalculatedAmount,
        percentage: 0,
        should_percentage_reset: false,
        to_account: '',
    };

    it('should render the component', () => {
        render(<PercentageSelector {...percentage_selector_props} />);

        expect(screen.getByTestId('dt_percentage_selector_id')).toBeInTheDocument();
    });

    it('should calculate the percentage amount on click of percentage block', () => {
        render(<PercentageSelector {...percentage_selector_props} />);

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_1'));
        expect(screen.getByText(`25% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_2'));
        expect(screen.getByText(`50% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_3'));
        expect(screen.getByText(`75% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_4'));
        expect(screen.getByText(`100% of available balance (100.00 USD)`)).toBeInTheDocument();
    });

    it('should reset the percentage block upon clicking twice', () => {
        render(<PercentageSelector {...percentage_selector_props} />);

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_1'));
        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_1'));

        expect(screen.getByText(`0% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_2'));
        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_2'));

        expect(screen.getByText(`25% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_3'));
        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_3'));

        expect(screen.getByText(`50% of available balance (100.00 USD)`)).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_4'));
        fireEvent.click(screen.getByTestId('dt_percentage_selector_block_id_4'));

        expect(screen.getByText(`75% of available balance (100.00 USD)`)).toBeInTheDocument();
    });

    it('should reset the percentage', () => {
        render(<PercentageSelector {...percentage_selector_props} should_percentage_reset />);

        expect(screen.getByText('0% of available balance (100.00 USD)')).toBeInTheDocument();
    });
});
