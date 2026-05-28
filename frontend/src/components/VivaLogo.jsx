import React from 'react';

const VivaLogo = ({ className = "", size }) => {
  // SVG star path template for Left, Right and Center stars
  const starPath = "M 0,-6 L 1.8,-1.8 L 6.2,-1.8 L 2.6,0.8 L 4,5 L 0,2.4 L -4,5 L -2.6,0.8 L -6.2,-1.8 L -1.8,-1.8 Z";
  
  return (
    <svg 
      className={className} 
      width={size || "100%"} 
      height={size || "100%"} 
      viewBox="0 0 500 500" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Clockwise top curve for UNISEX SALON */}
        <path id="top-arc-logo" d="M 68,250 A 182,182 0 0,1 432,250" />
        {/* Counter-clockwise bottom curve for THE COMPLETE MAKEOVER */}
        <path id="bottom-arc-logo" d="M 432,250 A 182,182 0 0,1 68,250" />
      </defs>

      {/* Circular golden outer rim */}
      <circle cx="250" cy="250" r="240" stroke="#D4A437" strokeWidth="4" />
      <circle cx="250" cy="250" r="232" stroke="#D4A437" strokeWidth="1.5" strokeDasharray="5 3" />
      
      {/* Outer ring charcoal background */}
      <circle cx="250" cy="250" r="231" fill="#15181C" />

      {/* Internal golden separator ring */}
      <circle cx="250" cy="250" r="172" stroke="#D4A437" strokeWidth="3" />
      <circle cx="250" cy="250" r="166" stroke="#D4A437" strokeWidth="1" strokeDasharray="3 2" />
      
      {/* Inner circle background */}
      <circle cx="250" cy="250" r="165" fill="#0E1013" />

      {/* Curved Text UNISEX SALON */}
      <text fill="#D4A437" fontSize="19" fontWeight="900" letterSpacing="10" fontFamily="'Cinzel', 'Playfair Display', serif">
        <textPath href="#top-arc-logo" startOffset="50%" textAnchor="middle">
          UNISEX SALON
        </textPath>
      </text>

      {/* Curved Text THE COMPLETE MAKEOVER */}
      <text fill="#D4A437" fontSize="15" fontWeight="800" letterSpacing="6" fontFamily="'Poppins', 'Inter', sans-serif">
        <textPath href="#bottom-arc-logo" startOffset="50%" textAnchor="middle">
          THE COMPLETE MAKEOVER
        </textPath>
      </text>

      {/* Left side gold stars */}
      <path d={starPath} transform="translate(84, 250) scale(1.4)" fill="#D4A437" />
      <path d={starPath} transform="translate(90, 210) scale(1.4)" fill="#D4A437" />
      <path d={starPath} transform="translate(90, 290) scale(1.4)" fill="#D4A437" />

      {/* Right side gold stars */}
      <path d={starPath} transform="translate(416, 250) scale(1.4)" fill="#D4A437" />
      <path d={starPath} transform="translate(410, 210) scale(1.4)" fill="#D4A437" />
      <path d={starPath} transform="translate(410, 290) scale(1.4)" fill="#D4A437" />

      {/* Upper Crossed Comb & Scissors */}
      <g stroke="#D4A437" strokeLinecap="round" fill="none">
        {/* Comb */}
        <path d="M 215,112 L 285,147" strokeWidth="3" />
        <path d="M 220,115 L 217,125 M 225,118 L 222,128 M 230,121 L 227,131 M 235,124 L 232,134 M 240,127 L 237,137 M 245,130 L 242,140 M 250,133 L 247,143 M 255,136 L 252,146 M 260,139 L 257,149 M 265,142 L 262,152 M 270,145 L 267,155 M 275,148 L 272,158 M 280,151 L 277,161" strokeWidth="1.5" />
        
        {/* Scissors */}
        <path d="M 285,112 L 215,147" strokeWidth="3" />
        <circle cx="291" cy="110" r="7" strokeWidth="2.5" />
        <circle cx="209" cy="149" r="7" strokeWidth="2.5" />
      </g>

      {/* Upper center gold star */}
      <path d={starPath} transform="translate(250, 168) scale(1.4)" fill="#D4A437" />

      {/* Silhouettes of hair styles flanking text, facing OUTWARDS */}
      {/* Left (Male Profile with curly hair, facing left) */}
      <path 
        d="M 190,205 C 175,205 165,212 160,222 C 158,226 154,228 154,232 C 154,236 150,239 148,241 C 146,243 148,245 152,246 C 154,247 154,249 152,252 C 150,255 152,257 155,258 C 157,259 156,261 155,263 C 153,266 156,268 160,270 C 165,272 168,278 172,284 C 176,290 174,298 172,305 C 178,305 186,300 190,290 C 194,280 192,240 190,205 Z" 
        fill="#D4A437" 
        fillOpacity="0.18" 
        stroke="#D4A437" 
        strokeWidth="1.5" 
        strokeOpacity="0.7" 
      />
      {/* Right (Female Profile with flowing hair, facing right) */}
      <path 
        d="M 310,205 C 325,205 335,212 340,222 C 342,226 346,228 346,232 C 346,236 350,239 352,241 C 354,243 352,245 348,246 C 346,247 346,249 348,252 C 350,255 348,257 345,258 C 343,259 344,261 345,263 C 347,266 344,268 340,270 C 335,272 332,278 328,284 C 324,290 326,298 328,305 C 322,305 314,300 310,290 C 306,280 308,240 310,205 Z" 
        fill="#D4A437" 
        fillOpacity="0.18" 
        stroke="#D4A437" 
        strokeWidth="1.5" 
        strokeOpacity="0.7" 
      />

      {/* Large white/gold scissors pointing down, blades forming V behind VIVA */}
      <g strokeLinecap="round">
        {/* Left blade (pivot to top right) */}
        <path 
          d="M 246,325 L 360,140 C 345,185 320,240 258,295 Z" 
          fill="white" 
          stroke="#D4A437" 
          strokeWidth="2.5" 
        />
        {/* Right blade (pivot to top left) */}
        <path 
          d="M 254,325 L 140,140 C 155,185 180,240 242,295 Z" 
          fill="white" 
          stroke="#D4A437" 
          strokeWidth="2.5" 
        />
        {/* Handles */}
        <circle cx="210" cy="385" r="28" stroke="white" strokeWidth="5" fill="none" />
        <circle cx="290" cy="385" r="28" stroke="white" strokeWidth="5" fill="none" />
        {/* Finger rest/tang */}
        <path d="M 186,396 C 172,404 160,398 154,386 C 160,378 174,382 186,390" stroke="white" strokeWidth="5" fill="none" />
        
        {/* Pivot screw */}
        <circle cx="250" cy="325" r="8" fill="white" stroke="#D4A437" strokeWidth="2.5" />
        <circle cx="250" cy="325" r="3" fill="#D4A437" />
      </g>

      {/* Core VIVA gold text */}
      <text 
        x="250" 
        y="272" 
        fill="#D4A437" 
        fontSize="76" 
        fontWeight="900" 
        fontFamily="'Outfit', 'Inter', sans-serif" 
        letterSpacing="4"
        textAnchor="middle"
      >
        VIVA
      </text>
    </svg>
  );
};

export default VivaLogo;
