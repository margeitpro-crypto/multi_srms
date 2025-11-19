
import React from 'react';

export const ComputerDesktopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="computerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(79, 70, 229)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(124, 58, 237)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#computerGrad)" d="M9 1.5c-2.43 0-4.38 1.95-4.38 4.38V12c0 2.43 1.95 4.38 4.38 4.38h6c2.43 0 4.38-1.95 4.38-4.38V5.88c0-2.43-1.95-4.38-4.38-4.38H9zm0 1.5h6c1.59 0 2.88 1.29 2.88 2.88V12c0 1.59-1.29 2.88-2.88 2.88H9c-1.59 0-2.88-1.29-2.88-2.88V5.88c0-1.59 1.29-2.88 2.88-2.88z" />
        <path fill="url(#computerGrad)" d="M8.25 18.75a.75.75 0 000 1.5h7.5a.75.75 0 000-1.5h-7.5z" />
    </svg>
);
