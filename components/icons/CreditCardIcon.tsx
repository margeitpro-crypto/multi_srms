
import React from 'react';

export const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="creditCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(5, 150, 105)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#creditCardGrad)" d="M2.25 8.25h19.5v7.5H2.25v-7.5z" />
        <path fill="url(#creditCardGrad)" fillRule="evenodd" d="M2.25 5.25A2.25 2.25 0 014.5 3h15A2.25 2.25 0 0121.75 5.25v13.5A2.25 2.25 0 0119.5 21h-15A2.25 2.25 0 012.25 18.75V5.25zm1.5.75a.75.75 0 01.75-.75h15a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6zm.75 10.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
    </svg>
);
