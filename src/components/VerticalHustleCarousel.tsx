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
 * Vertical auto-sliding carousel for hustles.
 * Shows 1-2 cards at a time, smoothly scrolls vertically, pauses on hover.
 */
const VerticalHustleCarousel = ({ hustles, boostedIds, intervalMs = 3500 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || hustles.length <= 1) return;
    const el = containerRef.current;

    const tick = () => {
      if (!el || isHoveredRef.current) return;
      const cardHeight = el.firstElementChild
        ? (el.firstElementChild as HTMLElement).offsetHeight + 16
        : 320;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
      if (atBottom) {
        el.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ top: cardHeight, behavior: "smooth" });
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [hustles.length, intervalMs]);

  if (hustles.length === 0) return null;

  return (
    <div className="relative">
      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-background to-transparent" />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background to-transparent" />

      <div
        ref={containerRef}
        onMouseEnter={() => (isHoveredRef.current = true)}
        onMouseLeave={() => (isHoveredRef.current = false)}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto scroll-smooth snap-y snap-mandatory pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {hustles.map((h) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="snap-start"
          >
            <HustleCard hustle={h} isBoosted={boostedIds?.has(h.id)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VerticalHustleCarousel;
