import { useState } from "react";
import { HustleWithDetails } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Navigation, Rocket, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import VerificationBadge from "@/components/VerificationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedHustleIds, useToggleSave } from "@/hooks/useSavedHustles";

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

  const media = hustle.hustle_media?.sort((a, b) => a.display_order - b.display_order) || [];
  const profileData = hustle.profiles as any;
  const categoryData = hustle.hustle_categories as any;
  const hustleAny = hustle as any;
  const logoUrl = hustleAny.logo_url;
  const mainImage = media[0]?.media_url;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave.mutate({ hustleId: hustle.id, isSaved });
  };

  return (
    <Link to={`/hustle/${hustle.id}`}>
      <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
        <Card className={`group overflow-hidden transition-all duration-300 rounded-2xl ${
          featured
            ? "shadow-lg ring-2 ring-[hsl(45,93%,47%)]/30 hover:shadow-xl"
            : isBoosted
            ? "ring-2 ring-primary/40 shadow-lg bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl hover:ring-primary/60"
            : "shadow-md hover:shadow-lg border-border/50"
        }`}>
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {mainImage ? (
              <img src={mainImage} alt={hustle.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-4xl opacity-30">📷</span>
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            {/* Save */}
            {user && (
              <button onClick={handleSave} className="absolute top-3 right-3 z-10 rounded-full bg-background/70 p-2 backdrop-blur-sm transition-all hover:scale-110 hover:bg-background/90 shadow-md">
                <Heart className={`h-4 w-4 ${isSaved ? "text-destructive fill-destructive" : "text-foreground/80"}`} />
              </button>
            )}

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {featured && (
                <Badge className="bg-[hsl(45,93%,47%)] text-black border-0 gap-1 font-semibold text-[11px] shadow-md">
                  <Star className="h-3 w-3" /> Featured
                </Badge>
              )}
              {isBoosted && (
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-[11px] gap-1 shadow-md">
                  <Rocket className="h-3 w-3" /> Boosted
                </Badge>
              )}
            </div>

            {/* Media count */}
            {media.length > 1 && (
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-md px-2 py-0.5 text-[11px] text-white font-medium" style={user ? { top: '3rem' } : {}}>
                {media.length} photos
              </div>
            )}

            {/* Bottom overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover bg-background shadow-md ring-1 ring-white/20" />
                  ) : (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-xs font-bold text-primary-foreground shadow-md">
                      {profileData?.display_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-xs font-semibold drop-shadow-sm">{profileData?.display_name || "Unknown"}</p>
                    <VerificationBadge level={profileData?.verification_level ?? 0} />
                  </div>
                </div>
                {hustle.price && (
                  <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 font-bold text-sm px-2.5 py-1 shadow-md">
                    {hustle.price_type === "negotiable" ? "Negotiable" : `R${hustle.price}${hustle.price_type === "hourly" ? "/hr" : ""}`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              {categoryData && (
                <Badge variant="outline" className="text-[10px] font-medium px-1.5 py-0">
                  {categoryData.name}
                </Badge>
              )}
              {hustle.is_available_now && (
                <Badge className="bg-success/10 text-success border-success/20 text-[10px] px-1.5 py-0">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Available
                </Badge>
              )}
            </div>
            <h3 className="line-clamp-1 font-bold text-foreground text-sm group-hover:text-primary transition-colors">
              {hustle.title}
            </h3>
            <p className="line-clamp-2 text-xs text-muted-foreground mt-1 leading-relaxed">
              {hustle.description}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              {hustle.distance != null && (
                <span className="flex items-center gap-0.5 text-[11px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded-full">
                  <Navigation className="h-2.5 w-2.5" />
                  {hustle.distance < 1 ? `${(hustle.distance * 1000).toFixed(0)}m` : `${hustle.distance.toFixed(1)}km`}
                </span>
              )}
              {hustle.location && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5" />
                  <span className="line-clamp-1 max-w-[100px]">{hustle.location}</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default HustleCard;
