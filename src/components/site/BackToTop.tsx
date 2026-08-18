import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      className="fixed bottom-6 right-6 z-40 flex size-11 items-center justify-center rounded-full bg-forest-deep text-ivory shadow-lg transition-all duration-300 hover:bg-forest-deep/80 hover:shadow-xl motion-safe:animate-[fadeInScale_0.3s_ease-out]
        [&:not([data-visible='true'])]:pointer-events-none [&:not([data-visible='true'])]:scale-0 [&:not([data-visible='true'])]:opacity-0"
      data-visible={visible}
      style={{
        animation: visible
          ? "fadeInScale 0.3s ease-out forwards"
          : "none",
        transform: visible ? undefined : "scale(0)",
        opacity: visible ? undefined : 0,
      }}
    >
      <ArrowUp className="size-5" />
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-visible='true'] {
            animation: none !important;
            transition: opacity 0.2s ease !important;
          }
        }
      `}</style>
    </button>
  );
}
