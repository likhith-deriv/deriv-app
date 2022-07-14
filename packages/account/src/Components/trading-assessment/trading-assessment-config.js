import { localize } from '@deriv/translations';

export const trading_assessment = [
    {
        question_text: 'Do you understand that you could potentially lose 100% of the money you use to trade?',
        section: 'risk_tolerance',
        answer_options: [
            { value: 'option_1', text: localize('Yes') },
            { value: 'option_2', text: localize('No') },
        ],
        answer: ['option_1'],
    },
    {
        question_text: 'How much knowledge and experience do you have in relation to online trading?',
        section: 'source_of_experience',
        answer_options: [
            {
                value: 'option_1',
                text: localize(
                    'I have an academic degree, professional certification, and/or work experience related to financial services.'
                ),
            },
            {
                value: 'option_2',
                text: localize(
                    'I trade forex CFDs and other complex financial instruments regularly on other platforms.'
                ),
            },
            {
                value: 'option_3',
                text: localize('I have attended seminars, training, and/or workshops related to trading.'),
            },
            {
                value: 'option_4',
                text: localize('I am interested in trading but have very little experience.'),
            },
            {
                value: 'option_5',
                text: localize('I have no knowledge and experience in trading at all.'),
            },
        ],
        answer: ['option_1', 'option_2', 'option_3'],
    },
    // start dropdown
    {
        section: 'trading_experience',
        questions: [
            {
                question_text: localize('How much experience do you have in CFD trading?'),

                answer_options: [
                    {
                        text: localize('No experience'),
                        value: 'option_1',
                    },
                    {
                        text: localize('Less than a year'),
                        value: 'option_2',
                    },
                    {
                        text: localize('1-2 years'),
                        value: 'option_3',
                    },
                    {
                        text: localize('Over 3 years'),
                        value: 'option_4',
                    },
                ],
                answer: ['option_2', 'option_3', 'option_4'],
            },
            {
                question_text: localize('How many CFD trades have you placed in the past 12 months?'),

                answer_options: [
                    {
                        text: localize('None'),
                        value: 'option_1',
                    },
                    {
                        text: '1-5',
                        value: 'option_2',
                    },
                    {
                        text: '6-10',
                        value: 'option_3',
                    },
                    {
                        text: '11-39',
                        value: 'option_4',
                    },
                    {
                        text: localize('40 or more'),
                        value: 'option_5',
                    },
                ],
                answer: ['option_3,option_4,option_5'],
            },
            {
                question_text: localize('How much experience do you have with other financial instruments?'),

                answer_options: [
                    {
                        text: localize('No experience'),
                        value: 'No experience',
                    },
                    {
                        text: localize('Less than a year'),
                        value: 'Less than a year',
                    },
                    {
                        text: localize('1-2 years'),
                        value: '1-2 years',
                    },
                    {
                        text: localize('Over 3 years'),
                        value: 'Over 3 years',
                    },
                ],
                answer: ['option_3', 'option_4', 'option_5'],
            },
            {
                question_text: localize(
                    'How many trades have you placed with other financial instruments in the past 12 months?'
                ),

                answer_options: [
                    {
                        text: localize('None'),
                        value: 'option_1',
                    },
                    {
                        text: '1-5',
                        value: 'option_2',
                    },
                    {
                        text: '6-10',
                        value: 'option_3',
                    },
                    {
                        text: '11-39',
                        value: 'option_4',
                    },
                    {
                        text: localize('40 or more'),
                        value: 'option_5',
                    },
                ],
                answer: ['option_3', 'option_4', 'option_5'],
            },
        ],
    },
    // end
    {
        question_text: 'In your understanding, CFD trading allows you to',
        section: 'trading_knowledge',
        answer_options: [
            {
                value: 'option_1',
                text: localize('Purchase commodities or shares of a company.'),
            },
            {
                value: 'option_2',
                text: localize(
                    'Place a bet on the price movement of an asset where the outcome is a fixed return or nothing at all.'
                ),
            },
            {
                value: 'option_3',
                text: localize('Speculate on the price movement of an asset without actually owning it.'),
            },
            {
                value: 'option_4',
                text: localize('Make a long-term investment for a guaranteed profit.'),
            },
        ],
        answer: ['option_3'],
    },
    {
        question_text: 'How does leverage affect CFD trading?',
        section: 'trading_knowledge',
        answer_options: [
            {
                value: 'option_1',
                text: localize('Leverage helps to mitigate risk.'),
            },
            {
                value: 'option_2',
                text: localize('Leverage prevents you from opening large positions.'),
            },
            { value: 'option_3', text: localize('Leverage guarantees profits.') },
            {
                value: 'option_4',
                text: localize(
                    'Leverage lets you open large positions for a fraction of trade value, which may result in increased profit or loss.'
                ),
            },
        ],
        answer: ['option_2'],
    },
    {
        question_text:
            'Leverage trading is high-risk, so it’s a good idea to use risk management features such as stop loss. Stop loss allows you to',
        section: 'trading_knowledge',
        answer_options: [
            {
                value: 'option_1',
                text: localize('Cancel your trade at any time within a specified timeframe.'),
            },
            {
                value: 'option_2',
                text: localize(
                    'Close your trade automatically when the loss is equal to or more than a specified amount, as long as there is adequate market liquidity.'
                ),
            },
            {
                value: 'option_3',
                text: localize(
                    'Close your trade automatically when the profit is equal to or more than a specified amount, as long as there is adequate market liquidity.'
                ),
            },
            {
                value: 'option_4',
                text: localize('Make a guaranteed profit on your trade.'),
            },
        ],
        answer: ['option_2'],
    },
    {
        question_text: 'When do you need to pay an initial margin?',
        section: 'trading_knowledge',
        answer_options: [
            {
                value: 'option_1',
                text: localize('When opening a leveraged CFD trade'),
            },
            { value: 'option_2', text: 'When trading multipliers' },
            {
                value: 'option_3',
                text: localize('When buying shares of a company'),
            },
            { value: 'option_4', text: localize('All of the above') },
        ],
        answer: ['option_1'],
    },
];
