
import React from 'react';

export const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <defs>
      <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'rgb(96, 165, 250)', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path fill="url(#buildingGradient)" d="M19.5 21a.75.75 0 01-.75-.75v-8.033a2.25 2.25 0 00-1.125-1.949l-3-1.75a.75.75 0 01-.375-.649V3.75A.75.75 0 0115 3h.75a.75.75 0 01.75.75v3.19l3.438 2.006c.49.286.812.803.812 1.365V20.25a.75.75 0 01-.75.75z" />
    <path fill="url(#buildingGradient)" fillRule="evenodd" d="M6 3a.75.75 0 01.75.75v16.5A.75.75 0 016 21H4.5a.75.75 0 01-.75-.75V3.75A.75.75 0 014.5 3H6zm5.25 0a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V3.75A.75.75 0 019.75 3h1.5z" clipRule="evenodd" />
  </svg>
);
