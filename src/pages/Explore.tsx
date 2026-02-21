import { useState } from "react";
import { useHustles, useCategories } from "@/hooks/useData";
import Navbar from "@/components/Navbar";
import HustleCard from "@/components/HustleCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const Explore = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: hustles, isLoading } = useHustles(selectedCategory, search);
  const { data: categories } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Explore Hustles</h1>
          <p className="text-muted-foreground">Find the perfect service in your community</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search hustles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2">
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

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : hustles && hustles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hustles.map((hustle) => (
              <motion.div
                key={hustle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <HustleCard hustle={hustle} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No hustles found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
