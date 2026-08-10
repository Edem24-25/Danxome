import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "left" | "right" | "scale" | "blur";

const variantClasses: Record<RevealVariant, { hidden: string; visible: string }> = {
  up: {
    hidden: "translate-y-8 opacity-0",
    visible: "translate-y-0 opacity-100",
  },
  left: {
    hidden: "-translate-x-8 opacity-0",
    visible: "translate-x-0 opacity-100",
  },
  right: {
    hidden: "translate-x-8 opacity-0",
    visible: "translate-x-0 opacity-100",
  },
  scale: {
    hidden: "scale-92 opacity-0",
    visible: "scale-100 opacity-100",
  },
  blur: {
    hidden: "blur-md opacity-0",
    visible: "blur-0 opacity-100",
  },
};

/** Reveals children with a configurable animation when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  variant?: RevealVariant;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  const v = variantClasses[variant];

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        shown ? v.visible : v.hidden,
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Staggered reveal for lists — wraps multiple Reveal components with incrementing delays. */
export function StaggerReveal({
  children,
  stagger = 80,
  variant = "up",
  className,
}: {
  children: ReactNode[];
  stagger?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.isArray(children) ? (
        children.map((child, i) => (
          <Reveal key={i} delay={i * stagger} variant={variant}>
            {child}
          </Reveal>
        ))
      ) : (
        <Reveal variant={variant}>{children}</Reveal>
      )}
    </div>
  );
}
