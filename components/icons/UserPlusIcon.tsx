import React from 'react';

export const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="userPlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(96, 165, 250)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#userPlusGradient)" d="M10.5 6a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0zM2 17.5a8.5 8.5 0 0117 0v.416a1.5 1.5 0 01-3 0V17.5a5.5 5.5 0 00-11 0v.416a1.5 1.5 0 01-3 0v-.416z" />
    <path fill="url(#userPlusGradient)" d="M19 10.5a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" />
  </svg>
);