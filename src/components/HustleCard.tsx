import { useState, useRef } from "react";
import { HustleWithDetails } from "@/hooks/useData";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Navigation, Rocket, Heart, Play, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import VerificationBadge from "@/components/VerificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedHustleIds, useToggleSave } from "@/hooks/useSavedHustles";
import { useHustleViewCount } from "@/hooks/useViews";

interface HustleCardProps {
  hustle: HustleWithDetails;
  featured?: boolean;
  isBoosted?: boolean;
}

const HustleCard = ({ hustle, featured, isBoosted }: HustleCardProps) => {
  const { user } = useAuth();
  const { data: savedIds } = useSavedHustleIds();
  const toggleSave = useToggleSave();
  const isSaved = savedIds?.has(hustle.id) ?? false;
  const { data: viewCount } = useHustleViewCount(hustle.id);

  const media = hustle.hustle_media?.sort((a, b) => a.display_order - b.display_order) || [];
  const profileData = hustle.profiles as any;
  const categoryData = hustle.hustle_categories as any;
  const hustleAny = hustle as any;
  const logoUrl = hustleAny.logo_url;
  const mainImage = media[0]?.media_url;
  const mainIsVideo = media[0]?.media_type === "video";
  const videoRef = useRef<HTMLVideoElement>(null);
  const availableFrom = hustleAny.available_from;
  const availableTo = hustleAny.available_to;
  const [imgIdx, setImgIdx] = useState(0);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave.mutate({ hustleId: hustle.id, isSaved });
  };

  return (
    <Link to={`/hustle/${hustle.id}`} className="block">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`group relative overflow-hidden rounded-3xl bg-card transition-all duration-300 ${
          featured
            ? "ring-2 ring-[hsl(45,93%,47%)]/40 shadow-[0_8px_30px_-10px_hsl(45,93%,47%,0.4)] hover:shadow-[0_12px_40px_-10px_hsl(45,93%,47%,0.6)]"
            : isBoosted
            ? "ring-2 ring-primary/40 shadow-[0_8px_30px_-10px_hsl(var(--primary)/0.4)] hover:shadow-[0_12px_40px_-10px_hsl(var(--primary)/0.6)] bg-gradient-to-br from-primary/5 via-card to-card"
            : "shadow-[0_4px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] border border-border/40"
        }`}
      >
        {/* Media area – tall aspect for premium feel */}
        <div className="relative aspect-[5/6] w-full overflow-hidden bg-muted">
          {mainIsVideo && mainImage ? (
            <div className="relative h-full w-full">
              <video
                ref={videoRef}
                src={mainImage}
                className="h-full w-full object-cover"
                muted
                loop
                playsInline
                onMouseEnter={() => videoRef.current?.play()}
                onMouseLeave={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="rounded-full bg-black/55 p-3 backdrop-blur-md ring-1 ring-white/30">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
            </div>
          ) : mainImage ? (
            <img
              src={media[imgIdx]?.media_url || mainImage}
              alt={hustle.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-muted/40">
              <span className="text-5xl opacity-30">✨</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Top row: badges + save */}
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {featured && (
                <Badge className="bg-[hsl(45,93%,47%)] text-black border-0 gap-1 font-semibold text-[11px] shadow-md backdrop-blur-sm">
                  <Star className="h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
              {isBoosted && (
                <Badge className="bg-gradient-to-r from-primary to-orange-500 text-primary-foreground border-0 text-[11px] gap-1 shadow-md">
                  <Rocket className="h-3 w-3" /> Boosted
                </Badge>
              )}
              {hustle.is_available_now && (
                <Badge className="bg-emerald-500/95 text-white border-0 text-[10px] backdrop-blur-sm">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </Badge>
              )}
            </div>
            {user && (
              <button
                onClick={handleSave}
                aria-label={isSaved ? "Unsave hustle" : "Save hustle"}
                className="rounded-full bg-white/15 p-2 backdrop-blur-md ring-1 ring-white/30 transition-all hover:scale-110 hover:bg-white/25"
              >
                <Heart className={`h-4 w-4 ${isSaved ? "text-red-400 fill-red-400" : "text-white"}`} />
              </button>
            )}
          </div>

          {/* Image dot indicators */}
          {media.length > 1 && !mainIsVideo && (
            <div className="absolute bottom-[110px] left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {media.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}

          {/* Bottom info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 space-y-2.5">
            {/* Owner row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="h-9 w-9 rounded-xl object-cover bg-background/90 ring-2 ring-white/30 shadow-md" />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-md ring-2 ring-white/30">
                    {profileData?.display_name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold drop-shadow truncate max-w-[120px]">{profileData?.display_name || "Hustler"}</p>
                  <VerificationBadge level={profileData?.verification_level ?? 0} />
                </div>
              </div>
              {(viewCount ?? 0) > 0 && (
                <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white backdrop-blur-sm ring-1 ring-white/20">
                  <Eye className="h-3 w-3" /> {viewCount}
                </div>
              )}
            </div>

            {/* Title + price */}
            <div>
              <h3 className="text-white text-base font-bold leading-snug line-clamp-2 drop-shadow">
                {hustle.title}
              </h3>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  {categoryData && <span className="rounded-full bg-white/15 px-2 py-0.5 backdrop-blur-sm">{categoryData.name}</span>}
                  {hustle.location && (
                    <span className="flex items-center gap-0.5 truncate max-w-[110px]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{hustle.location}</span>
                    </span>
                  )}
                </div>
                {hustle.price && (
                  <span className="rounded-xl bg-white text-foreground font-extrabold text-sm px-3 py-1 shadow-lg whitespace-nowrap">
                    {hustle.price_type === "negotiable" ? "Neg." : `R${hustle.price}${hustle.price_type === "hourly" ? "/hr" : ""}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer meta strip */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-card border-t border-border/40">
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
            {availableFrom && availableTo && (
              <span className="flex items-center gap-1 bg-muted rounded-full px-2 py-0.5">
                <Clock className="h-3 w-3" /> {availableFrom.slice(0, 5)}-{availableTo.slice(0, 5)}
              </span>
            )}
            {hustle.distance != null && (
              <span className="flex items-center gap-1 text-primary font-medium bg-primary/10 rounded-full px-2 py-0.5">
                <Navigation className="h-3 w-3" />
                {hustle.distance < 1 ? `${(hustle.distance * 1000).toFixed(0)}m` : `${hustle.distance.toFixed(1)}km`}
              </span>
            )}
          </div>
          {media.length > 1 && (
            <span className="text-[10px] text-muted-foreground">{media.length} 📸</span>
          )}
        </div>
      </motion.article>
    </Link>
  );
};

export default HustleCard;
