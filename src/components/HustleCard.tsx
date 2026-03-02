import { useState } from "react";
import { HustleWithDetails } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Navigation, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import VerificationBadge from "@/components/VerificationBadge";

interface HustleCardProps {
  hustle: HustleWithDetails;
  featured?: boolean;
  isBoosted?: boolean;
}

const HustleCard = ({ hustle, featured, isBoosted }: HustleCardProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
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

  return (
    <Link to={`/hustle/${hustle.id}`}>
      <Card className={`group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated ${featured ? "shadow-premium ring-1 ring-premium/30" : isBoosted ? "shadow-card ring-1 ring-primary/20" : "shadow-card"}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {media.length > 0 ? (
            <>
              {media[currentIdx]?.media_type === "video" ? (
                <video src={media[currentIdx].media_url} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" muted />
              ) : (
                <img src={media[currentIdx]?.media_url} alt={hustle.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              )}
              {media.length > 1 && (
                <>
                  <button onClick={prevMedia} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={nextMedia} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-1 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {media.slice(0, 5).map((_, i) => (
                      <span key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentIdx ? "bg-primary-foreground" : "bg-primary-foreground/40"}`} />
                    ))}
                    {media.length > 5 && <span className="text-[8px] text-primary-foreground/60">+{media.length - 5}</span>}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="text-4xl text-muted-foreground/40">📷</span>
            </div>
          )}
          {featured && (
            <div className="absolute left-3 top-3">
              <Badge className="gradient-premium text-premium-foreground border-0 gap-1 font-semibold">
                <Star className="h-3 w-3" /> Featured
              </Badge>
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1">
            {isBoosted && (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs gap-1">
                <Rocket className="h-3 w-3" /> Boosted
              </Badge>
            )}
            {hustle.is_available_now && (
              <Badge className="bg-success text-success-foreground border-0 text-xs">
                Available Now
              </Badge>
            )}
          </div>
          {hustle.price && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm font-semibold text-foreground">
                {hustle.price_type === "negotiable" ? "Negotiable" : `R${hustle.price}${hustle.price_type === "hourly" ? "/hr" : ""}`}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-2">
            {categoryData && (
              <Badge variant="outline" className="text-xs">
                {categoryData.name}
              </Badge>
            )}
          </div>
          <h3 className="mb-1 line-clamp-1 font-semibold text-foreground group-hover:text-primary transition-colors">
            {hustle.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {hustle.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {profileData?.display_name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-xs text-muted-foreground">{profileData?.display_name || "Unknown"}</span>
              <VerificationBadge level={profileData?.verification_level ?? 0} />
            </div>
            <div className="flex items-center gap-2">
              {hustle.distance != null && (
                <div className="flex items-center gap-1 text-xs text-primary font-medium">
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
    </Link>
  );
};

export default HustleCard;
