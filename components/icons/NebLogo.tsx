import React from 'react';

// Using the official Coat of Arms of Nepal from Wikimedia Commons as requested
export const NebLogo: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/2/23/Emblem_of_Nepal.svg" 
    alt="Government of Nepal Logo" 
    {...props} 
  />
);
