
import React from 'react';

export const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="academicCapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(99, 102, 241)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(129, 140, 248)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#academicCapGradient)" d="M11.25 4.533A9.708 9.708 0 001.5 8.611V15a.75.75 0 00.485.707l8.25 4.125a.75.75 0 00.53 0l8.25-4.125A.75.75 0 0019.5 15V8.611a9.708 9.708 0 00-9.75-4.078z" />
    <path fill="#fff" d="M11.25 4.533A9.708 9.708 0 001.5 8.611V15a.75.75 0 00.485.707l8.25 4.125a.75.75 0 00.53 0l8.25-4.125A.75.75 0 0019.5 15V8.611a9.708 9.708 0 00-9.75-4.078z" opacity="0.2" />
    <path fill="url(#academicCapGradient)" d="M22.5 8.611a.75.75 0 00-1.5 0V15a2.25 2.25 0 01-1.285 2.083l-6.75 3.375a2.25 2.25 0 01-1.93 0l-6.75-3.375A2.25 2.25 0 013 15V8.611a.75.75 0 00-1.5 0V15a3.75 3.75 0 002.142 3.472l6.75 3.375a3.75 3.75 0 003.216 0l6.75-3.375A3.75 3.75 0 0022.5 15V8.611z" />
  </svg>
);
