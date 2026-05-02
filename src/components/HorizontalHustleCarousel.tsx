import { useEffect, useRef } from "react";
import { HustleWithDetails } from "@/hooks/useData";
import HustleCard from "@/components/HustleCard";
import { motion } from "framer-motion";

interface Props {
  hustles: HustleWithDetails[];
  boostedIds?: Set<string>;
  intervalMs?: number;
}

/**
 * Horizontal auto-sliding carousel for hustles.
 * Smoothly scrolls sideways, pauses on hover/touch, loops at end.
 */
const HorizontalHustleCarousel = ({ hustles, boostedIds, intervalMs = 3500 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hustles.length <= 1) return;
    const el = containerRef.current;

    const tick = () => {
      if (!el || isPausedRef.current) return;
      const cardWidth = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetWidth + 16
        : 280;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [hustles.length, intervalMs]);

  if (hustles.length === 0) return null;

  return (
    <div className="relative">
      {/* Side fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />

      <div
        ref={containerRef}
        onMouseEnter={() => (isPausedRef.current = true)}
        onMouseLeave={() => (isPausedRef.current = false)}
        onTouchStart={() => (isPausedRef.current = true)}
        onTouchEnd={() => {
          setTimeout(() => (isPausedRef.current = false), 2000);
        }}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {hustles.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="snap-start shrink-0 w-[78%] sm:w-[44%] lg:w-[31%] xl:w-[23%]"
          >
            <HustleCard hustle={h} isBoosted={boostedIds?.has(h.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalHustleCarousel;
