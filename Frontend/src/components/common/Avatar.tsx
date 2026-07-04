import React, { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "profile",
  className = "",
}) => {
  const [imgStatus, setImgStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  const hasValidSrc = src && src.trim() !== "";

  return (
    <>
      {hasValidSrc && imgStatus === "loading" && (
        <SkeletonAvatar className={className} />
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
        <FallbackAvatar className={className} />
      )}
    </>
  );
};

const SkeletonAvatar: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 flex-shrink-0 ${className}`}
    />
  );
};

const FallbackAvatar: React.FC<{ className: string }> = ({ className }) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 overflow-hidden flex-shrink-0 ${className}`}
    >
      <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );
};

export default Avatar;
