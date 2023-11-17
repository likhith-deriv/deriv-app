import React, { useState } from 'react';
import { useSettings, useStatesList } from '@deriv/api';
import { Dropzone, FlowTextField } from '../../../../components';
import { InlineMessage, WalletDropdown, WalletText } from '../../../../components/Base';
import Upload from '../../../../public/images/accounts/upload.svg';
import { getExampleImagesConfig } from '../../constants';
import { CommonMistakesExamples } from '../CommonMistakesExamples';
import './ResubmitPOA.scss';

const ResubmitPOA: React.FC = () => {
    const { data } = useSettings();
    const country = data?.country_code || '';
    const { data: statesList } = useStatesList(country);

    const [selectedState, setSelectedState] = useState('');

    // Will replace this with formik values later
    const handleSelect = (value: string) => {
        setSelectedState(value);
    };

    return (
        <div className='wallets-poa'>
            <div className='wallets-poa__address'>
                <div className='wallets-poa__address__title'>
                    <WalletText weight='bold'>Address</WalletText>
                    <div className='wallets-poa__address__title__divider' />
                </div>
                <div className='wallets-poa__address__container__inline'>
                    <InlineMessage size='md' type='warning' variant='contained'>
                        <div className='wallets-poa__address__inline-message'>
                            For faster verification, input the same address here as in your proof of address document
                            (see section below)
                        </div>
                    </InlineMessage>
                </div>
                <div className='wallets-poa__address__input'>
                    <FlowTextField label='First line of address*' name='firstLine' />
                    <FlowTextField label='Second line of address' name='secondLine' />
                    <FlowTextField label='Town/City*' name='townCityLine' />
                    <WalletDropdown
                        label='State/Province'
                        list={statesList}
                        listHeight='sm'
                        name='StateProvinceDropdownLine'
                        onSelect={handleSelect}
                        value={selectedState}
                    />
                    <FlowTextField label='Postal/ZIP Code' name='zipCodeLine' />
                </div>
            </div>

            <div className='wallets-poa__document'>
                <div className='wallets-poa__document__title'>
                    <WalletText weight='bold'>Document Submission</WalletText>
                    <div className='wallets-poa__document__title__divider' />
                </div>
                <div className='wallets-poa__document__container'>
                    <div className='wallets-poa__document__container__disclaimer'>
                        <WalletText size='sm' weight='bold'>
                            We accept only these types of documents as proof of address. The document must be recent
                            (issued within last 6 months) and include your name and address:
                        </WalletText>

                        <ul className='wallets-poa__document__container__disclaimer__list'>
                            <li>
                                <WalletText size='sm'>
                                    Utility bill: electricity, water, gas, or landline phone bill.
                                </WalletText>
                            </li>
                            <li>
                                <WalletText size='sm'>
                                    Financial, legal, or government document: recent bank statement, affidavit, or
                                    government-issued letter.
                                </WalletText>
                            </li>
                            <li>
                                <WalletText size='sm'>Home rental agreement: valid and current agreement.</WalletText>
                            </li>
                        </ul>
                    </div>
                    <div className='wallets-poa__document__container__upload'>
                        <WalletText size='sm' weight='bold'>
                            Upload File
                        </WalletText>
                        <Dropzone
                            description='Remember, selfies, pictures of houses, or non-related images will be rejected.'
                            descriptionColor='primary'
                            descriptionSize='sm'
                            fileFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']}
                            hoverMessage='Upload your file here'
                            icon={<Upload />}
                            maxSize={8388608}
                            title='Drag and drop a file or click to browse your files.'
                            titleType='bold'
                        />
                        <div className='wallets-poa__document__container__upload__requirements'>
                            <WalletText size='sm'>Supported formats : JPEG, JPG, PNG, PDF, and GIF only</WalletText>
                            <WalletText size='sm'>Maximum size : 8MB</WalletText>
                        </div>
                    </div>
                    <div className='wallets-poa__document__container__common-mistakes'>
                        <WalletText size='sm' weight='bold'>
                            Common Mistakes
                        </WalletText>

                        <div className='wallets-common-mistakes__content'>
                            {getExampleImagesConfig().map(config => (
                                <CommonMistakesExamples
                                    description={config.description}
                                    image={<config.image />}
                                    key={`common-mistake-${config.description}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResubmitPOA;
