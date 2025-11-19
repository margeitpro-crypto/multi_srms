
import React from 'react';

export const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="clipboardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(34, 197, 94)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#clipboardGrad)" fillRule="evenodd" d="M10.5 3A2.5 2.5 0 008 5.5V6h8v-.5A2.5 2.5 0 0013.5 3h-3zm-2.49 4.006a3.5 3.5 0 016.98 0H18.75a.75.75 0 01.75.75v11a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18.25v-11a.75.75 0 01.75-.75h2.76zM11.47 14.53a.75.75 0 001.06-1.06l-2.25-2.25a.75.75 0 00-1.06 0l-1.125 1.125a.75.75 0 101.06 1.06l.6-.6L11.47 14.53z" clipRule="evenodd" />
    </svg>
);
