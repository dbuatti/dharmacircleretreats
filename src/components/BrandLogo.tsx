import React from "react";

export const BrandLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-[#1e2a5e] p-1 ${className}`}>
      {/* Simplified representation of the floral crest logo */}
      <div className="w-full h-full rounded-full border-2 border-[#e5e7eb]/30 flex items-center justify-center">
        <div className="w-4 h-4 bg-[#e5e7eb] rounded-full opacity-80" />
      </div>
    </div>
  );
};