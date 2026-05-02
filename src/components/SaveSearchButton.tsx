import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  query?: string;
  categoryId?: string;
  maxDistanceKm?: number;
  location?: string;
}

const SaveSearchButton = ({ query, categoryId, maxDistanceKm, location }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return toast.error("Sign in to save searches");
    if (!name.trim()) return toast.error("Name your search");
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_searches").insert({
        user_id: user.id,
        name: name.trim(),
        query_text: query || null,
        category_id: categoryId || null,
        max_distance_km: maxDistanceKm || null,
        location: location || null,
      });
      if (error) throw error;
      toast.success("Search saved!");
      setName("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
          <Bookmark className="h-4 w-4" /> Save
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <p className="text-sm font-semibold mb-2">Save this search</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Plumbers in Tembisa" maxLength={60} />
        <Button onClick={save} disabled={saving} className="mt-2 w-full gradient-primary text-primary-foreground">
          {saving ? "Saving..." : "Save"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default SaveSearchButton;
