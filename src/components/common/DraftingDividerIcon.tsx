import React from 'react';

interface DraftingDividerIconProps {
  className?: string;
  size?: number;
}

/**
 * Minimal geometric instrument icon featuring a precision circle and drafting divider / compass with reduced line thickness.
 * Designed for BuildSmith architectural & precision engineering aesthetic.
 */
export const DraftingDividerIcon: React.FC<DraftingDividerIconProps> = ({
  className = 'w-6 h-6',
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
      {/* Precision drafted geometric circle - r=10 */}
      <circle cx="12" cy="12" r="10" strokeWidth="1.4" className="opacity-90" />

      {/* Top knurled handle */}
      <path d="M12 1.5v3" strokeWidth="1.6" />

      {/* Central pivot hinge joint */}
      <circle cx="12" cy="5.5" r="1.8" strokeWidth="1.4" fill="currentColor" className="opacity-20" />
      <circle cx="12" cy="5.5" r="1.8" strokeWidth="1.4" />

      {/* Left divider leg */}
      <path d="M11 7L4.5 21" strokeWidth="1.4" />

      {/* Right divider leg */}
      <path d="M13 7L19.5 21" strokeWidth="1.4" />

      {/* Measuring / adjustment arc */}
      <path d="M7.5 13.5a6 6 0 0 1 9 0" strokeWidth="1.2" />

      {/* Center fine-adjustment screw */}
      <circle cx="12" cy="12.5" r="1" fill="currentColor" strokeWidth="0" />
    </svg>
  );
};
