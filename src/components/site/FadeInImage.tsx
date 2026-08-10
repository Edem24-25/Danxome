import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * FadeInImage — image avec animation de fondu progressif et placeholder blur.
 */
export function FadeInImage({
  src,
  alt,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder blur */}
      <div
        className={cn(
          "absolute inset-0 bg-secondary transition-opacity duration-700",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "size-full object-cover transition-all duration-700",
          loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-105",
        )}
        {...props}
      />
    </div>
  );
}
