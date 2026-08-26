import { cn } from "@/lib/utils";

interface BrandLogoProps {
  alt?: string;
  className?: string;
}

/** Official HBS HOME wordmark, shared by public and Admin surfaces. */
export function BrandLogo({ alt = "HBS HOME", className }: BrandLogoProps) {
  return (
    <img
      src="/apple-touch-icon.png"
      alt={alt}
      width={180}
      height={180}
      className={cn("block object-cover object-center", className)}
    />
  );
}
