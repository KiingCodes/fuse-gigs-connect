import { useState, useMemo } from "react";
import { useHustles, useCategories, HustleWithDetails } from "@/hooks/useData";
import { useActiveBoostedHustleIds } from "@/hooks/useBoosts";
import { useGeolocation, getDistanceKm } from "@/hooks/useGeolocation";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HustleCard from "@/components/HustleCard";
import HustleMap from "@/components/HustleMap";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, MapPin, List, Map, Locate, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTypewriter } from "@/hooks/useTypewriter";
import SaveSearchButton from "@/components/SaveSearchButton";

type SortOption = "distance" | "newest" | "price_low" | "price_high";
type DistanceFilter = "1" | "5" | "10" | "25" | "50" | "any";

const SOUTH_AFRICAN_SUBURBS = [
  "Tembisa", "Soweto", "Mamelodi", "Khayelitsha", "Alexandra",
  "Sandton", "Randburg", "Midrand", "Centurion", "Pretoria CBD",
  "Johannesburg CBD", "Rosebank", "Fourways", "Braamfontein", "Hillbrow",
  "Diepsloot", "Roodepoort", "Benoni", "Boksburg", "Kempton Park",
  "Germiston", "Springs", "Alberton", "Vereeniging", "Vanderbijlpark",
];

// Approximate coords for manual suburb search
const SUBURB_COORDS: Record<string, { lat: number; lng: number }> = {
  Tembisa: { lat: -25.9960, lng: 28.2268 },
  Soweto: { lat: -26.2485, lng: 27.8540 },
  Mamelodi: { lat: -25.7207, lng: 28.3986 },
  Khayelitsha: { lat: -34.0389, lng: 18.6767 },
  Alexandra: { lat: -26.1068, lng: 28.0987 },
  Sandton: { lat: -26.1076, lng: 28.0567 },
  Randburg: { lat: -26.0936, lng: 28.0060 },
  Midrand: { lat: -25.9891, lng: 28.1270 },
  Centurion: { lat: -25.8603, lng: 28.1894 },
  "Pretoria CBD": { lat: -25.7479, lng: 28.2293 },
  "Johannesburg CBD": { lat: -26.2041, lng: 28.0473 },
  Rosebank: { lat: -26.1454, lng: 28.0440 },
  Fourways: { lat: -26.0188, lng: 28.0125 },
  Braamfontein: { lat: -26.1929, lng: 28.0368 },
  Hillbrow: { lat: -26.1878, lng: 28.0490 },
  Diepsloot: { lat: -25.9314, lng: 28.0182 },
  Roodepoort: { lat: -26.1625, lng: 27.8725 },
  Benoni: { lat: -26.1886, lng: 28.3206 },
  Boksburg: { lat: -26.2120, lng: 28.2576 },
  "Kempton Park": { lat: -26.1003, lng: 28.2326 },
  Germiston: { lat: -26.2177, lng: 28.1700 },
  Springs: { lat: -26.2546, lng: 28.4421 },
  Alberton: { lat: -26.2681, lng: 28.1224 },
  Vereeniging: { lat: -26.6736, lng: 27.9262 },
  Vanderbijlpark: { lat: -26.7113, lng: 27.8380 },
};

const Explore = () => {
  const [search, setSearch] = useState("");
  const suburbTypewriter = useTypewriter([
    "Search suburb (Tembisa, Soweto...)",
    "Try Sandton or Midrand",
    "Find services in Pretoria",
    "Look up Cape Town areas",
  ]);
  const searchTypewriter = useTypewriter([
    "Search hustles...",
    "e.g. plumber, tutor, hair stylist",
    "Find a barber near you",
    "Need car wash today?",
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>("any");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [suburbSearch, setSuburbSearch] = useState("");
  const [showSuburbSuggestions, setShowSuburbSuggestions] = useState(false);

  const { data: hustles, isLoading } = useHustles(selectedCategory, search);
  const { data: categories } = useCategories();
  const { data: boostedIds } = useActiveBoostedHustleIds();
  const { location: userLocation, loading: geoLoading, requestLocation, setLocation } = useGeolocation();

  const filteredSuburbs = SOUTH_AFRICAN_SUBURBS.filter((s) =>
    s.toLowerCase().includes(suburbSearch.toLowerCase())
  );

  const selectSuburb = (suburb: string) => {
    setSuburbSearch(suburb);
    setShowSuburbSuggestions(false);
    const coords = SUBURB_COORDS[suburb];
    if (coords) {
      setLocation(coords);
      toast.success(`Location set to ${suburb}`);
    }
  };

  const handleGPS = () => {
    requestLocation();
    toast.info("Getting your location...");
  };

  // Calculate distances and apply filters
  const processedHustles = useMemo(() => {
    if (!hustles) return [];

    let results: HustleWithDetails[] = hustles.map((h) => {
      // If hustle has no lat/lng but has a location string, try to match to suburb coords
      let lat = h.latitude;
      let lng = h.longitude;
      if (!lat && !lng && h.location) {
        const locLower = h.location.toLowerCase();
        for (const [suburb, coords] of Object.entries(SUBURB_COORDS)) {
          if (locLower.includes(suburb.toLowerCase())) {
            lat = coords.lat;
            lng = coords.lng;
            break;
          }
        }
      }

      if (userLocation && lat && lng) {
        return {
          ...h,
          latitude: lat,
          longitude: lng,
          distance: getDistanceKm(userLocation.lat, userLocation.lng, lat, lng),
        };
      }
      return { ...h, latitude: lat ?? h.latitude, longitude: lng ?? h.longitude, distance: undefined };
    });

    // Available now filter
    if (availableOnly) {
      results = results.filter((h) => h.is_available_now);
    }

    // Distance filter
    if (distanceFilter !== "any" && userLocation) {
      const maxKm = parseFloat(distanceFilter);
      results = results.filter((h) => h.distance != null && h.distance <= maxKm);
    }

    // Sort
    switch (sortBy) {
      case "distance":
        results.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
        break;
      case "price_low":
        results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_high":
        results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "newest":
      default:
        // Already sorted by created_at from query
        break;
    }

    // Sort boosted first, then by selected sort
    results.sort((a, b) => {
      const aB = boostedIds?.has(a.id) ? 1 : 0;
      const bB = boostedIds?.has(b.id) ? 1 : 0;
      if (aB !== bB) return bB - aB;
      return 0;
    });

    return results;
  }, [hustles, userLocation, availableOnly, distanceFilter, sortBy, boostedIds]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Explore Hustles" description="Browse local services and freelancers in your community." path="/explore" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-1 text-3xl font-bold text-foreground">Discover Near You</h1>
          <p className="text-muted-foreground">Find services in your neighbourhood</p>
        </div>

        {/* Location Bar */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={handleGPS}
            disabled={geoLoading}
            className="gap-2 shrink-0"
          >
            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
            Find Near Me
          </Button>

          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search suburb (e.g. Tembisa, Soweto...)"
              value={suburbSearch}
              onChange={(e) => {
                setSuburbSearch(e.target.value);
                setShowSuburbSuggestions(true);
              }}
              onFocus={() => setShowSuburbSuggestions(true)}
              className="pl-9"
            />
            {showSuburbSuggestions && suburbSearch && filteredSuburbs.length > 0 && (
              <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-elevated max-h-48 overflow-y-auto">
                {filteredSuburbs.map((s) => (
                  <button
                    key={s}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => selectSuburb(s)}
                  >
                    <MapPin className="mr-2 inline h-3 w-3 text-muted-foreground" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {userLocation && (
            <span className="text-xs text-muted-foreground shrink-0">
              📍 {userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)}
            </span>
          )}
        </div>

        {/* Search + Filters Row */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hustles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={distanceFilter} onValueChange={(v) => setDistanceFilter(v as DistanceFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Within 1 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
              <SelectItem value="25">Within 25 km</SelectItem>
              <SelectItem value="50">Within 50 km</SelectItem>
              <SelectItem value="any">Any distance</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
              <SelectItem value="price_low">Price: Low</SelectItem>
              <SelectItem value="price_high">Price: High</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Switch id="available" checked={availableOnly} onCheckedChange={setAvailableOnly} />
            <Label htmlFor="available" className="text-sm whitespace-nowrap">Available Now</Label>
          </div>

          <div className="flex gap-1 border border-border rounded-lg p-0.5">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className={`h-8 px-3 ${viewMode === "list" ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "map" ? "default" : "ghost"}
              className={`h-8 px-3 ${viewMode === "map" ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setViewMode("map")}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Badge
            variant={!selectedCategory ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-sm transition-all ${!selectedCategory ? "gradient-primary text-primary-foreground border-0" : ""}`}
            onClick={() => setSelectedCategory(undefined)}
          >
            All
          </Badge>
          {categories?.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 text-sm transition-all ${selectedCategory === cat.id ? "gradient-primary text-primary-foreground border-0" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </Badge>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : viewMode === "map" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <HustleMap
              hustles={processedHustles}
              userLocation={userLocation}
              className="h-[500px] lg:h-[600px]"
            />
            <div className="max-h-[600px] overflow-y-auto space-y-4 pr-1">
              {processedHustles.length > 0 ? (
                processedHustles.map((hustle) => (
                  <HustleCard key={hustle.id} hustle={hustle} isBoosted={boostedIds?.has(hustle.id)} />
                ))
              ) : (
                <p className="py-10 text-center text-muted-foreground">No hustles found in this area.</p>
              )}
            </div>
          </div>
        ) : processedHustles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {processedHustles.map((hustle) => (
              <motion.div
                key={hustle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HustleCard hustle={hustle} isBoosted={boostedIds?.has(hustle.id)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg text-muted-foreground">No hustles found. Try a different search, category, or location.</p>
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            {processedHustles.length} result{processedHustles.length !== 1 ? "s" : ""} found
            {userLocation && distanceFilter !== "any" ? ` within ${distanceFilter} km` : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default Explore;
