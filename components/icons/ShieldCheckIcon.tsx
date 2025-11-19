
import React from 'react';

export const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="shieldCheckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(22, 163, 74)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#shieldCheckGrad)" fillRule="evenodd" d="M12.832 2.138a.75.75 0 00-1.664 0l-8.25 4.125a.75.75 0 000 1.332l8.25 4.125a.75.75 0 001.664 0l8.25-4.125a.75.75 0 000-1.332l-8.25-4.125zM21 9.75a.75.75 0 01-.397.666l-8.25 4.125a.75.75 0 01-1.664 0l-8.25-4.125A.75.75 0 012.25 9.75v3.834c0 .39.16.76.444 1.026l7.5 7.5a.75.75 0 001.06 0l7.5-7.5a1.44 1.44 0 00.444-1.026V9.75zm-10.03 8.03a.75.75 0 00-1.06-1.06l-2.25 2.25a.75.75 0 101.06 1.06l2.25-2.25zm4.5-4.5a.75.75 0 00-1.06-1.06l-5.25 5.25a.75.75 0 001.06 1.06l5.25-5.25z" clipRule="evenodd" />
    </svg>
);
