import React from 'react';
import { APIProvider } from '@deriv/api';
import { BrandDerivLogoCoralIcon } from '@deriv/quill-icons';
import './index.scss';

const App: React.FC = () => (
    <APIProvider standalone>
        <div className='h-200 bg-solid-coral-500 w-400'>Account V2</div>
        <div>
            <BrandDerivLogoCoralIcon />
        </div>
    </APIProvider>
);

export default App;
