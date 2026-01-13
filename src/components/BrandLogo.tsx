import React from "react";

export const BrandLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}>
      <img 
        src="/dharma_logo_2b.png" 
        alt="Dharma Circle Logo" 
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback to the original design if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.classList.add('bg-[#1e2a5e]');
            parent.classList.add('border-2');
            parent.classList.add('border-[#e5e7eb]/30');
            parent.innerHTML = '<span class="text-white font-serif italic text-[0.6em]">DC</span>';
          }
        }}
      />
    </div>
  );
};