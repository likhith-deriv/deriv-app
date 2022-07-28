import React from 'react';
import { Field } from 'formik';
import { DesktopWrapper, Dropdown, MobileWrapper, Text, SelectNative } from '@deriv/components';

const TradingAssessmentDropdownOption = ({ item_list, onChange, values, setFieldValue, setEnableNextSection }) => {
    React.useEffect(() => {
        checkIfAllFieldsFilled();
    }, [values]);

    const checkIfAllFieldsFilled = () => {
        let enable_next_section = false;
        if (
            values.cfd_experience &&
            values.cfd_frequency &&
            values.trading_experience_financial_instruments &&
            values.trading_frequency_financial_instruments
        ) {
            enable_next_section = true;
        }
        setEnableNextSection(enable_next_section);
    };

    return (
        <div className='trading-assessment__wrapper__dropdown'>
            {item_list.map((question, index) => (
                <Field name={question.form_control} key={index}>
                    {() => {
                        return (
                            <>
                                <DesktopWrapper>
                                    <Dropdown
                                        classNameDisplay='trading-assessment__wrapper__dropdown--mobile--display'
                                        is_align_text_left
                                        name={question?.question_text}
                                        placeholder={question?.question_text}
                                        list={question?.answer_options}
                                        onChange={e => onChange(e, question.form_control, setFieldValue)}
                                        value={values[question.form_control]}
                                    />
                                </DesktopWrapper>
                                <MobileWrapper>
                                    <Text as='h1' color='prominent' weight='bold' size='xs'>
                                        {question?.question_text}
                                    </Text>
                                    <SelectNative
                                        placeholder={question?.answer_options[0].text}
                                        label={question?.answer_options[0].text}
                                        name={question?.question_text}
                                        list_items={question?.answer_options}
                                        onChange={e => {
                                            onChange(e, question.form_control, setFieldValue);
                                        }}
                                        value={values[question.form_control]}
                                        should_show_empty_option={false}
                                        hide_placeholder={true}
                                    />
                                </MobileWrapper>
                            </>
                        );
                    }}
                </Field>
            ))}
        </div>
    );
};

export default TradingAssessmentDropdownOption;
