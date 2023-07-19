import React from 'react';
import { Checkbox } from '@deriv/components';
import { FieldInputProps } from 'formik';

type TCheckboxFieldProps = {
    field: FieldInputProps<boolean>;
    id: string;
    className: string;
    label: string;
};

/*
 * This component is used with Formik's Field component.
 */
const CheckboxField = ({ field: { name, value, onChange }, id, label, className, ...props }: TCheckboxFieldProps) => {
    return (
        <div className={className}>
            <Checkbox value={value} name={name} label={label} onChange={onChange} {...props} />
        </div>
    );
};

export default CheckboxField;
