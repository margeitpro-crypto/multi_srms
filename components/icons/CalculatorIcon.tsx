
import React from 'react';

export const CalculatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="calculatorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(234, 179, 8)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(202, 138, 4)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#calculatorGrad)" fillRule="evenodd" d="M3.75 3A1.75 1.75 0 002 4.75v14.5A1.75 1.75 0 003.75 21h16.5A1.75 1.75 0 0022 19.25V4.75A1.75 1.75 0 0020.25 3H3.75zm12.75 3.75a.75.75 0 00-1.5 0v2.25h-2.25a.75.75 0 000 1.5H15V12.75a.75.75 0 001.5 0V10.5h2.25a.75.75 0 000-1.5H16.5V6.75zm-6.75 2.25h-3a.75.75 0 000 1.5h3a.75.75 0 000-1.5zm0 3h-3a.75.75 0 000 1.5h3a.75.75 0 000-1.5zm-3 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
    </svg>
);
