import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, Search, MapPin, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

const SavedSearches = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: searches, isLoading } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("saved_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("saved_searches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-searches"] });
      toast.success("Removed");
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase.from("saved_searches").delete().eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-searches"] });
      toast.success("Cleared search history");
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Sign in to view your saved searches.</p>
          <Link to="/auth"><Button className="gradient-primary text-primary-foreground">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const runSearch = (s: any) => {
    const params = new URLSearchParams();
    if (s.query_text) params.set("q", s.query_text);
    if (s.category_id) params.set("category", s.category_id);
    if (s.location) params.set("location", s.location);
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Saved Searches" path="/saved-searches" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Bookmark className="h-6 w-6 text-primary" /> Saved Searches</h1>
            <p className="text-sm text-muted-foreground mt-1">Quick access to searches you've saved</p>
          </div>
          {searches && searches.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => clearAll.mutate()} className="gap-1.5 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
        ) : !searches || searches.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No saved searches yet</p>
            <p className="text-sm mt-1">Save a search from the Explore page to find it here.</p>
            <Link to="/explore"><Button className="mt-4 gradient-primary text-primary-foreground">Browse Hustles</Button></Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {searches.map((s: any) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <button onClick={() => runSearch(s)} className="flex-1 text-left">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {s.query_text && <Badge variant="secondary" className="gap-1 text-xs"><Search className="h-3 w-3" />{s.query_text}</Badge>}
                      {s.location && <Badge variant="secondary" className="gap-1 text-xs"><MapPin className="h-3 w-3" />{s.location}</Badge>}
                      {s.max_distance_km && <Badge variant="secondary" className="text-xs">{s.max_distance_km}km</Badge>}
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground">Saved {format(new Date(s.created_at), "MMM d, yyyy")}</p>
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(s.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedSearches;
