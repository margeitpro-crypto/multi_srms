
import React from 'react';

export const DocumentChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="docChartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(22, 163, 74)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#docChartGrad)" fillRule="evenodd" d="M3 2.25A2.25 2.25 0 00.75 4.5v15A2.25 2.25 0 003 21.75h18A2.25 2.25 0 0023.25 19.5v-15A2.25 2.25 0 0021 2.25H3zm15.63 9a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-3h.75a.75.75 0 00.75-.75zm-5.63-3a.75.75 0 00-.75.75v7.5a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75zm-4.5 5.25a.75.75 0 00-.75.75v1.5a.75.75 0 001.5 0v-1.5a.75.75 0 00-.75-.75z" clipRule="evenodd" />
    </svg>
);
