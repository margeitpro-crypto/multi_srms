
import React from 'react';

export const TableCellsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="tableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(244, 114, 182)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(219, 39, 119)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#tableGrad)" d="M12.96 16.92a.75.75 0 00-1.02-1.02L9 18.84l-2.4-2.4a.75.75 0 00-1.02 1.02l3 3a.75.75 0 001.02 0l4.38-4.38z" />
        <path fill="url(#tableGrad)" fillRule="evenodd" d="M3.75 3A1.75 1.75 0 002 4.75v14.5A1.75 1.75 0 003.75 21h16.5A1.75 1.75 0 0022 19.25V4.75A1.75 1.75 0 0020.25 3H3.75zm0 1.5h16.5a.25.25 0 01.25.25v2.5a.25.25 0 01-.25.25H3.75a.25.25 0 01-.25-.25v-2.5a.25.25 0 01.25-.25zM3.5 10a.25.25 0 00-.25.25v2.5a.25.25 0 00.25.25h16.5a.25.25 0 00.25-.25v-2.5a.25.25 0 00-.25-.25H3.5zM3.75 16h16.5a.25.25 0 01.25.25v2.5a.25.25 0 01-.25.25H3.75a.25.25 0 01-.25-.25v-2.5a.25.25 0 01.25-.25z" clipRule="evenodd" />
    </svg>
);
