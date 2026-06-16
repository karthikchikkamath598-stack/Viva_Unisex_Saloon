

import React from 'react';
import vivaLogoSrc from '../assets/viva_logo.png';

/**
 * VivaLogo – Official VIVA Unisex Salon brand logo.
 * Uses the uploaded official logo PNG at maximum quality.
 *
 * Props:
 *  - size (number|string) : pixel size for width & height (default: "100%")
 *  - className (string)   : extra CSS classes for styling
 *  - style (object)       : inline style overrides
 */
const VivaLogo = ({ className = '', size, style = {} }) => {
  const dimension = size ? `${size}px` : undefined;

  return (
    <img
      src={vivaLogoSrc}
      alt="VIVA Unisex Salon – The Complete Makeover"
      className={className}
      style={{
        width: dimension,
        height: dimension,
        objectFit: 'contain',
        imageRendering: 'crisp-edges',
        ...style,
      }}
      draggable={false}
    />
  );
};

export default VivaLogo;
