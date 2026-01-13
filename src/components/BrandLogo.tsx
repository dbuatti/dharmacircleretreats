import React from "react";

export const BrandLogo = ({ className = "w-12 h-12" }: { className?: string }) => {
  const [imageError, setImageError] = React.useState(false);

  // Try multiple possible paths
  const imagePaths = [
    "/images/dharma_logo_2b.webp",
    "/images/dharma_logo_2b.png",
    "/images/dharma_logo_2b.jpg",
    "/dharma_logo_2b.webp",
    "/dharma_logo_2b.png"
  ];

  const getFirstValidImage = () => {
    // For now, let's use the most likely path
    return "/images/dharma_logo_2b.webp";
  };

  if (imageError) {
    // Fallback: Show the original brand design
    return (
      <div 
        className={`flex items-center justify-center rounded-full bg-[#1e2a5e] border-2 border-[#e5e7eb]/30 ${className}`}
        title="Dharma Circle Logo"
      >
        <span className="text-white font-serif italic text-[0.6em]">DC</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center rounded-full overflow-hidden ${className}`}>
      <img 
        src={getFirstValidImage()}
        alt="Dharma Circle Logo"
        className="w-full h-full object-cover"
        onLoad={() => console.log("[BrandLogo] Image loaded successfully")}
        onError={(e) => {
          console.error("[BrandLogo] Failed to load image:", e);
          setImageError(true);
        }}
      />
    </div>
  );
};