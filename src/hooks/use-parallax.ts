import { useEffect, useState } from "react";

/**
 * Hook parallax — retourne un offset Y basé sur le scroll de l'élément.
 * Utilise `speed` (0 = fixe, 1 = scroll normal, >1 = accéléré)
 */
export function useParallax(speed = 0.3) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(window.scrollY * speed);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return offset;
}

/**
 * Hook pour détecter si un élément est dans le viewport.
 */
export function useInView(options?: IntersectionObserverInit) {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );
    io.observe(ref);
    return () => io.disconnect();
  }, [ref, options]);

  return { ref: setRef, inView };
}
