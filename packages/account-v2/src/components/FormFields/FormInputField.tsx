import React, { ComponentProps } from 'react';
import { Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Input } from '@deriv-com/ui';
import { validateField } from '../../utils/validation';

type FormInputFieldProps = Omit<ComponentProps<typeof Input>, 'isFullWidth' | 'label' | 'message' | 'name'> & {
    isFullWidth?: boolean;
    label: string;
    message?: string;
    name: string;
    validationSchema?: Yup.AnySchema;
};

/**
 * FormInputField is a wrapper around Input that can be used with Formik.
 * @name FormInputField
 * @param name - Name of the field
 * @param [validationSchema] - Yup validation schema to use for the field
 * @param [props] - Other props to pass to Input
 * @returns ReactNode
 */
export const FormInputField = ({ name, validationSchema, ...rest }: FormInputFieldProps) => (
    <Field name={name} validate={validateField(validationSchema)}>
        {({ field, meta: { error, touched } }: FieldProps<string>) => (
            <Input
                {...field}
                {...rest}
                aria-label={rest.label}
                autoComplete='off'
                error={Boolean(error && touched)}
                message={error ?? rest.message}
            />
        )}
    </Field>
);
