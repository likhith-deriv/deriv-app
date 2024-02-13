import { useSettings } from '@deriv/api';

/** A custom hook used for manual verification flow */
const useManualForm = () => {
    const { data: settings, ...rest } = useSettings();
    const countryCode = settings?.citizen ?? settings?.country_code;
    const isExpiryDateRequired = countryCode !== 'ng';

    return {
        isExpiryDateRequired,
        ...rest,
    };
};

export default useManualForm;
