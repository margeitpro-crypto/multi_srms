
import React from 'react';

export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
        <defs>
            <linearGradient id="paintBrushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgb(219, 39, 119)', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: 'rgb(236, 72, 153)', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <path fill="url(#paintBrushGrad)" fillRule="evenodd" d="M11.828 2.25c-.965 0-1.793.43-2.38 1.125l-2.122 2.121c-1.34.116-2.58.46-3.726 1.037a.75.75 0 00-.234 1.109l.64 1.28a.75.75 0 001.206.319 41.52 41.52 0 013.918-2.61L9 11.25a.75.75 0 001.5 0V7.53l.363-.363a.75.75 0 00-1.06-1.06L9 6.885 7.647 5.532c.16-.21.332-.412.512-.602a.75.75 0 00-1.08-1.04c-1.282 1.282-2.122 2.94-2.258 4.743a4.5 4.5 0 004.5 4.5 4.5 4.5 0 004.5-4.5c0-1.802-.876-3.46-2.258-4.743a.75.75 0 00-1.08 1.04c.18.19.352.391.512.602L11.25 7.53l.885-.885a.75.75 0 00-1.06-1.06L10.5 6.136l-.377.377a41.34 41.34 0 013.882 2.628.75.75 0 001.206-.319l.64-1.28a.75.75 0 00-.234-1.109c-1.146-.576-2.386-.92-3.726-1.037l-2.122-2.121C13.621 2.68 12.793 2.25 11.828 2.25zm.422 17.25a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clipRule="evenodd" />
    </svg>
);
