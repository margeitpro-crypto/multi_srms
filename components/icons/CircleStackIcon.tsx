
import React from 'react';

export const CircleStackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="circleStackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(2, 132, 199)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#circleStackGrad)" d="M12 2.25c-5.385 0-9.75 1.9-9.75 4.25s4.365 4.25 9.75 4.25 9.75-1.9 9.75-4.25S17.385 2.25 12 2.25zM12 10.75c-5.385 0-9.75 1.9-9.75 4.25s4.365 4.25 9.75 4.25 9.75-1.9 9.75-4.25-4.365-4.25-9.75-4.25zM12 19.25c-5.385 0-9.75 1.9-9.75 4.25v.5c0 1.5 4.365 2.75 9.75 2.75s9.75-1.25 9.75-2.75v-.5c0-2.35-4.365-4.25-9.75-4.25z" />
    </svg>
);
