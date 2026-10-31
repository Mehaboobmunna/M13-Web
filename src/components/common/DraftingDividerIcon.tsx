import React from 'react';

interface DraftingDividerIconProps {
  className?: string;
  size?: number;
}

/**
 * Minimal geometric instrument icon featuring a precision circle and drafting divider / compass.
 * Designed for BuildSmith architectural & precision engineering aesthetic.
 */
export const DraftingDividerIcon: React.FC<DraftingDividerIconProps> = ({
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
      className={className}
      aria-hidden="true"
    >
      {/* Precision drafted geometric circle */}
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" className="opacity-75" />

      {/* Top knurled handle */}
      <path d="M12 2v2.5" strokeWidth="2" />

      {/* Central pivot hinge joint */}
      <circle cx="12" cy="5.8" r="1.6" strokeWidth="1.6" />

      {/* Left divider leg */}
      <path d="M11 7.2L5.8 20" strokeWidth="1.75" />

      {/* Right divider leg */}
      <path d="M13 7.2L18.2 20" strokeWidth="1.75" />

      {/* Measuring / adjustment arc */}
      <path d="M8.2 13.5a5.5 5.5 0 0 1 7.6 0" strokeWidth="1.4" />

      {/* Center fine-adjustment screw */}
      <circle cx="12" cy="12.5" r="0.9" fill="currentColor" strokeWidth="0" />
    </svg>
  );
};
