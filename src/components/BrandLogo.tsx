import React from "react";

export const BrandLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-[#1e2a5e] p-1 ${className}`}>
      {/* Using the uploaded logo image */}
      <img 
        src="/images/pasted-image-2026-01-13T22-45-06-966Z.png" 
        alt="Dharma Circle Logo" 
        className="w-full h-full rounded-full object-cover"
        onError={(e) => {
          // Fallback to the original design if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.parentElement?.classList.add('bg-[#1e2a5e]');
          target.parentElement?.classList.add('border-2');
          target.parentElement?.classList.add('border-[#e5e7eb]/30');
        }}
      />
    </div>
  );
};