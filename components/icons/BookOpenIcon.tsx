
import React from 'react';

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="bookOpenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(251, 146, 60)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(249, 115, 22)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#bookOpenGradient)" d="M12 21.75c2.426 0 4.68-1.02 6.32-2.672V4.535a9.752 9.752 0 00-6.32 2.672V21.75zM11.25 4.67A9.723 9.723 0 005.68 2.006 9.71 9.71 0 003.75 2.25v16.828c1.64-1.652 3.894-2.678 6.32-2.678V4.67z" />
  </svg>
);
