
import React from 'react';

export const ArrowLeftOnRectangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="logoutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(248, 113, 113)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(239, 68, 68)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#logoutGradient)" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H7.5A2.25 2.25 0 005.25 6v12A2.25 2.25 0 007.5 20.25h6.75A2.25 2.25 0 0016.5 18v-2.25" />
    <path fill="url(#logoutGradient)" d="M12.75 15.75L15 13.5m0 0l-2.25-2.25M15 13.5H4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
