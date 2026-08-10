import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MagneticHover — effet magnétique au survol. L'élément se déplace légèrement vers le curseur.
 */
export function MagneticHover({
  children,
  className,
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setStyle({
      transform: `translate(${x * strength}px, ${y * strength}px)`,
    });
  };

  const handleMouseLeave = () => {
    setStyle({ transform: "translate(0, 0)" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={cn("transition-transform duration-300 ease-out", className)}
    >
      {children}
    </div>
  );
}
