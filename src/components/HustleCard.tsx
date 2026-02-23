import { HustleWithDetails } from "@/hooks/useData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

interface HustleCardProps {
  hustle: HustleWithDetails;
  featured?: boolean;
}

const HustleCard = ({ hustle, featured }: HustleCardProps) => {
  const firstMedia = hustle.hustle_media?.sort((a, b) => a.display_order - b.display_order)?.[0];
  const profileData = hustle.profiles as any;
  const categoryData = hustle.hustle_categories as any;

  return (
    <Link to={`/hustle/${hustle.id}`}>
      <Card className={`group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated ${featured ? "shadow-premium ring-1 ring-premium/30" : "shadow-card"}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {firstMedia ? (
            firstMedia.media_type === "video" ? (
              <video src={firstMedia.media_url} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" muted />
            ) : (
              <img src={firstMedia.media_url} alt={hustle.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
            )
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
