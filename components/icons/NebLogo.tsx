import React from 'react';

// A simplified representation of the Coat of Arms of Nepal (used by NEB)
export const NebLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
    <g>
      {/* Background shape */}
      <path d="M50,5 C25,5 10,25 10,50 C10,75 25,95 50,95 C75,95 90,75 90,50 C90,25 75,5 50,5 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="1"/>
      
      {/* Mountains */}
      <path d="M25,60 L50,30 L75,60 Z" fill="#D3D3D3"/>
      <path d="M35,60 L50,45 L65,60 Z" fill="#A9A9A9"/>
      
      {/* Sun and Moon */}
      <circle cx="30" cy="30" r="8" fill="#FFD700"/>
      <path d="M70,22 A10,10 0 0,0 70,38 A8,8 0 0,1 70,22 Z" fill="#F0F0F0"/>

      {/* Flag shapes */}
      <polygon points="40,70 50,60 60,70" fill="#DC143C"/>
      <polygon points="45,80 50,70 55,80" fill="#00008B"/>

      {/* Text placeholder */}
      <text x="50" y="90" fontFamily="serif" fontSize="6" textAnchor="middle" fill="#000000">जननी जन्मभूमिश्च स्वर्गादपि गरीयसी</text>
    </g>
  </svg>
);
