import { useState } from "react";
import { HustleWithDetails } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Navigation, ChevronLeft, ChevronRight, Rocket, Heart } from "lucide-react";
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
  const [currentIdx, setCurrentIdx] = useState(0);
  const { user } = useAuth();
  const { data: savedIds } = useSavedHustleIds();
  const toggleSave = useToggleSave();
  const isSaved = savedIds?.has(hustle.id) ?? false;

  const media = hustle.hustle_media?.sort((a, b) => a.display_order - b.display_order) || [];
  const profileData = hustle.profiles as any;
  const categoryData = hustle.hustle_categories as any;

  const prevMedia = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((i) => (i > 0 ? i - 1 : media.length - 1));
  };
  const nextMedia = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx((i) => (i < media.length - 1 ? i + 1 : 0));
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    toggleSave.mutate({ hustleId: hustle.id, isSaved });
  };

  return (
    <Link to={`/hustle/${hustle.id}`}>
      <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
        <Card className={`group overflow-hidden transition-all duration-500 ${
          featured
            ? "shadow-premium ring-2 ring-premium/40 hover:shadow-[0_0_30px_-5px_hsl(45,93%,47%/0.4)]"
            : isBoosted
            ? "ring-2 ring-primary/50 shadow-[0_0_20px_-5px_hsl(24,95%,53%/0.3)] bg-gradient-to-br from-primary/5 via-transparent to-primary/5 hover:shadow-[0_0_35px_-5px_hsl(24,95%,53%/0.4)]"
            : "shadow-card hover:shadow-elevated"
        }`}>
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            {media.length > 0 ? (
              <>
                {media[currentIdx]?.media_type === "video" ? (
                  <video src={media[currentIdx].media_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" muted />
                ) : (
                  <img src={media[currentIdx]?.media_url} alt={hustle.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {media.length > 1 && (
                  <>
                    <button onClick={prevMedia} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg" aria-label="Previous">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={nextMedia} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background hover:scale-110 shadow-lg" aria-label="Next">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {media.slice(0, 5).map((_, i) => (
                        <span key={i} className={`h-2 w-2 rounded-full transition-all duration-300 ${i === currentIdx ? "bg-primary-foreground scale-125 shadow-lg" : "bg-primary-foreground/40"}`} />
                      ))}
                      {media.length > 5 && <span className="text-[8px] text-primary-foreground/60 self-center">+{media.length - 5}</span>}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-5xl text-muted-foreground/30">📷</span>
              </div>
            )}

            {/* Save button */}
            {user && (
              <button
                onClick={handleSave}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-2 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-background shadow-lg"
              >
                <Heart className={`h-4 w-4 transition-colors ${isSaved ? "text-destructive fill-destructive" : "text-foreground"}`} />
              </button>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {featured && (
                <Badge className="gradient-premium text-premium-foreground border-0 gap-1 font-semibold shadow-lg">
                  <Star className="h-3 w-3" /> Featured
                </Badge>
              )}
              {isBoosted && (
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 text-xs gap-1 shadow-lg">
                  <Rocket className="h-3 w-3 animate-pulse" /> Boosted
                </Badge>
              )}
              {hustle.is_available_now && (
                <Badge className="bg-success text-success-foreground border-0 text-xs shadow-lg">
                  <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse" />
                  Available Now
                </Badge>
              )}
            </div>

            {hustle.price && (
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="bg-background/90 backdrop-blur-md font-bold text-foreground shadow-lg text-sm px-3 py-1">
                  {hustle.price_type === "negotiable" ? "Negotiable" : `R${hustle.price}${hustle.price_type === "hourly" ? "/hr" : ""}`}
                </Badge>
              </div>
            )}
          </div>

          <CardContent className={`p-4 ${isBoosted ? "border-t-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent" : ""}`}>
            <div className="mb-2 flex items-center gap-2 flex-wrap">
              {categoryData && (
                <Badge variant="outline" className="text-xs font-medium">
                  {categoryData.name}
                </Badge>
              )}
            </div>
            <h3 className="mb-1.5 line-clamp-1 font-bold text-foreground group-hover:text-primary transition-colors duration-300 text-[15px]">
              {hustle.title}
            </h3>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
              {hustle.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-primary/10">
                  {profileData?.display_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-foreground">{profileData?.display_name || "Unknown"}</span>
                  <VerificationBadge level={profileData?.verification_level ?? 0} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hustle.distance != null && (
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                    <Navigation className="h-3 w-3" />
                    <span>{hustle.distance < 1 ? `${(hustle.distance * 1000).toFixed(0)}m` : `${hustle.distance.toFixed(1)}km`}</span>
                  </div>
                )}
                {hustle.location && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="line-clamp-1 max-w-[80px]">{hustle.location}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
};

export default HustleCard;
