
import React from 'react';

export const NewspaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="newsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(219, 39, 119)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#newsGrad)" fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V3.375c0-1.036-.84-1.875-1.875-1.875H5.625zM12.75 12a.75.75 0 000 1.5h2.25a.75.75 0 000-1.5h-2.25zM12 15a.75.75 0 01.75.75h2.25a.75.75 0 010 1.5H12.75a.75.75 0 01-.75-.75V15zM7.5 7.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" />
    </svg>
);
