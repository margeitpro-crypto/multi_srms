
import React from 'react';

export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="userGroupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(34, 211, 238)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(14, 165, 233)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#userGroupGradient)" d="M10.375 2.25a4.125 4.125 0 100 8.25 4.125 4.125 0 000-8.25zM10.375 12a7.125 7.125 0 00-7.124 7.125 2.625 2.625 0 002.624 2.625h9a2.625 2.625 0 002.625-2.625A7.125 7.125 0 0010.375 12z" />
    <path fill="url(#userGroupGradient)" fillRule="evenodd" d="M19.875 3.75a2.625 2.625 0 00-2.625 2.625v.375a.75.75 0 01-1.5 0v-.375a4.125 4.125 0 118.25 0v.375a.75.75 0 01-1.5 0v-.375A2.625 2.625 0 0019.875 3.75zM14.625 12.75a.75.75 0 01.75.75v8.25a.75.75 0 01-1.5 0v-8.25a.75.75 0 01.75-.75zm6.75 0a.75.75 0 01.75.75v8.25a.75.75 0 01-1.5 0v-8.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
  </svg>
);
