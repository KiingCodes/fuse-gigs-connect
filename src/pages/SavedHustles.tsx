import { useSavedHustles } from "@/hooks/useSavedHustles";
import { useActiveBoostedHustleIds } from "@/hooks/useBoosts";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HustleCard from "@/components/HustleCard";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SavedHustles = () => {
  const { data: hustles, isLoading } = useSavedHustles();
  const { data: boostedIds } = useActiveBoostedHustleIds();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Saved Hustles" description="Your saved hustles" path="/saved" />
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-3xl font-bold text-foreground flex items-center gap-2">
            <Heart className="h-7 w-7 text-destructive fill-destructive" /> Saved Hustles
          </h1>
          <p className="mb-8 text-muted-foreground">Your bookmarked hustles in one place</p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : hustles && hustles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hustles.map((hustle: any, i: number) => (
              <motion.div
                key={hustle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <HustleCard hustle={hustle} isBoosted={boostedIds?.has(hustle.id)} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Heart className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg text-muted-foreground mb-4">No saved hustles yet</p>
            <Link to="/explore">
              <Button className="gradient-primary text-primary-foreground">Explore Hustles</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedHustles;
