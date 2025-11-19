
import React from 'react';

export const QueueListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="queueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#queueGrad)" fillRule="evenodd" d="M3.75 4.5A.75.75 0 003 5.25v13.5c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75V5.25a.75.75 0 00-.75-.75H3.75zM9 6a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H9zM9 9.75a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H9zM9 13.5a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H9zM5.25 7.5a2.25 2.25 0 00-2.25-2.25H3a.75.75 0 000 1.5h.041a.75.75 0 01.709.709V18a.75.75 0 001.5 0v-1.5a.75.75 0 00-1.5 0V9a.75.75 0 01-.188-.48c0-.064.01-.127.028-.188H4.5A.75.75 0 015.25 9v-.75A2.25 2.25 0 003 6V5.25a.75.75 0 01.75-.75h1.5a2.25 2.25 0 012.25 2.25v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 00-.75-.75H3.75a.75.75 0 000 1.5H4.5a.75.75 0 01.75.75v1.5z" clipRule="evenodd" />
    </svg>
);
