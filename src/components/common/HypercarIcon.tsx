import React from 'react';

interface HypercarIconProps {
  className?: string;
  size?: number;
}

/**
 * Ultra-clean neon cyan-glowing outline hypercar silhouette icon.
 */
export const HypercarIcon: React.FC<HypercarIconProps> = ({
  className = 'w-5 h-5',
  size,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={size ? { width: size, height: size } : undefined}
      className={`${className} filter drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]`}
      aria-hidden="true"
    >
      {/* Active Rear Wing/Spoiler */}
      <path d="M18.5 7.5l3.5-1M21 6.5v1.8" strokeWidth="1.3" className="text-cyan-300" />
      
      {/* Aerodynamic Body Silhouette */}
      <path
        d="M1.5 15.2h1.8c.3-1.6 1.7-2.7 3.4-2.7s3.1 1.1 3.4 2.7h4.8c.3-1.6 1.7-2.7 3.4-2.7s3.1 1.1 3.4 2.7h1c.8 0 1.2-.4 1.2-1.2 0-.8-.3-1.4-.7-2.1l-1.2-1.9c-.8-1.2-2.1-2.2-3.8-2.5-2.2-.4-5.2-.5-8.2 1.2-1.8 1-3.6 2.3-4.5 3.8l-.8 1.2c-.3.5-.7.8-1.2 1l-.5.2"
        strokeWidth="1.4"
      />

      {/* Canopy Glass / Windshield */}
      <path
        d="M6.8 11.8c1.2-1.8 3.2-3.2 5.8-3.4 2.2-.2 3.8.5 4.8 1.8l1 1.4"
        strokeWidth="1.2"
        className="opacity-90 text-cyan-200"
      />

      {/* Aggressive LED Headlight Bar */}
      <path d="M3.2 13.6l2.2-.8" strokeWidth="1.6" className="text-cyan-300" />

      {/* Front & Rear Wheels */}
      <circle cx="6.7" cy="15.2" r="2" strokeWidth="1.3" />
      <circle cx="6.7" cy="15.2" r="0.6" fill="currentColor" />

      <circle cx="16.7" cy="15.2" r="2" strokeWidth="1.3" />
      <circle cx="16.7" cy="15.2" r="0.6" fill="currentColor" />

      {/* Ground Glow Shadow Line */}
      <path d="M1 16.8h22" strokeWidth="0.8" strokeDasharray="1.5 1.5" className="opacity-50 text-cyan-400" />
    </svg>
  );
};
