import React, { useState } from "react";

interface BannerImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

const BannerImage: React.FC<BannerImageProps> = ({
  src,
  alt = "banner",
  className = "",
}) => {
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  const hasValidSrc = src && src.trim() !== "";

  return (
    <>
      {hasValidSrc && imgStatus === "loading" && (
        <SkeletonBanner className={className} />
      )}

      {hasValidSrc && imgStatus !== "error" && (
        <img
          src={src as string}
          alt={alt}
          onLoad={() => setImgStatus("loaded")}
          onError={() => setImgStatus("error")}
          className={className}
          style={{ display: imgStatus === "loaded" ? "block" : "none" }}
        />
      )}

      {(!hasValidSrc || imgStatus === "error") && (
        <FallbackBanner className={className} />
      )}
    </>
  );
};

const SkeletonBanner: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${className}`}
    />
  );
};

const FallbackBanner: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 overflow-hidden flex-shrink-0 ${className}`}
    >
      <svg className="w-12 h-12 opacity-50" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    </div>
  );
};

export default BannerImage;
