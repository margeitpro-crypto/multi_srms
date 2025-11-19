import React from 'react';

export const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="briefcaseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(16, 185, 129)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(5, 150, 105)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#briefcaseGradient)" d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V8.25c0 1.035.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V6.375c0-1.036-.84-1.875-1.875-1.875H3.375zM1.5 12c0-1.035.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v6.375c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V12z" />
  </svg>
);