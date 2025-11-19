
import React from 'react';

export const WrenchScrewdriverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(99, 102, 241)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(79, 70, 229)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#wrenchGrad)" fillRule="evenodd" d="M12.5 5.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM10.5 5.25a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75zM8.25 5.25a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zM6 5.25a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0V6a.75.75 0 00-.75-.75zM12.75 15.75a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75zM10.5 15.75a.75.75 0 00-.75.75v.01a.75.75 0 001.5 0v-.01a.75.75 0 00-.75-.75zm-1.5 0a.75.75 0 01.75.75v.01a.75.75 0 01-1.5 0v-.01a.75.75 0 01.75-.75z" clipRule="evenodd" />
        <path fill="url(#wrenchGrad)" d="M4.5 9.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 12.75a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" />
    </svg>
);
