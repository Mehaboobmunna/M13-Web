import React from 'react';

export const M13Icon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <div className={`relative rounded-full bg-slate-950 border-2 border-red-500/80 flex items-center justify-center shadow-lg shadow-red-500/30 overflow-hidden ${className}`}>
      {/* Outer glowing red ring */}
      <div className="absolute inset-0 rounded-full border border-red-500 animate-pulse pointer-events-none" />
      
      {/* Cybernetic insect / M13 minimalist silhouette */}
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]" xmlns="http://www.w3.org/2000/svg">
        {/* Central insect head/body */}
        <path d="M12 4L14 8H10L12 4Z" fill="currentColor" />
        <path d="M9 9H15V16H9V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Glowing eyes */}
        <circle cx="10.5" cy="11.5" r="0.75" fill="#fff" />
        <circle cx="13.5" cy="11.5" r="0.75" fill="#fff" />
        {/* Robotic legs */}
        <path d="M9 10L5 7M9 13L4 14M9 15L5 18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        <path d="M15 10L19 7M15 13L20 14M15 15L19 18" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    </div>
  );
};
