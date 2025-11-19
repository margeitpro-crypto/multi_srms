
import React from 'react';

export const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="clipboardListGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(5, 150, 105)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#clipboardListGrad)" d="M12.75 3.033A2.25 2.25 0 0010.5 1.5h-3A2.25 2.25 0 005.25 3.75v16.5A2.25 2.25 0 007.5 22.5h9A2.25 2.25 0 0018.75 20.25V5.25A2.25 2.25 0 0016.5 3h-3.75z" />
        <path fill="url(#clipboardListGrad)" fillRule="evenodd" d="M12.75 3.033A2.25 2.25 0 0010.5 1.5h-3A2.25 2.25 0 005.25 3.75v16.5A2.25 2.25 0 007.5 22.5h9A2.25 2.25 0 0018.75 20.25V5.25A2.25 2.25 0 0016.5 3h-3.75a.75.75 0 01-.75-.75V3.033zm-2.25-1.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" clipRule="evenodd" stroke="#fff" strokeWidth="1.5" />
        <path d="M9 9.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zM9 12.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9zM9 15.75a.75.75 0 000 1.5h6a.75.75 0 000-1.5H9z" fill="#fff" />
    </svg>
);
