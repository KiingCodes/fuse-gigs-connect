import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedHustleIds = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-hustles", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data, error } = await supabase
        .from("saved_hustles")
        .select("hustle_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return new Set((data || []).map((d: any) => d.hustle_id));
    },
    enabled: !!user,
  });
};

export const useSavedHustles = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["saved-hustles-full", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: saved, error } = await supabase
        .from("saved_hustles")
        .select("hustle_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (!saved || saved.length === 0) return [];

      const ids = saved.map((s: any) => s.hustle_id);
      const { data: hustles } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .in("id", ids)
        .eq("is_active", true);

      const userIds = [...new Set((hustles || []).map((h: any) => h.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (hustles || []).map((h: any) => ({ ...h, profiles: profileMap.get(h.user_id) }));
    },
    enabled: !!user,
  });
};

export const useToggleSave = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ hustleId, isSaved }: { hustleId: string; isSaved: boolean }) => {
      if (!user) throw new Error("Sign in to save hustles");
      if (isSaved) {
        await supabase.from("saved_hustles").delete().eq("user_id", user.id).eq("hustle_id", hustleId);
      } else {
        await supabase.from("saved_hustles").insert({ user_id: user.id, hustle_id: hustleId });
      }
    },
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ["saved-hustles"] });
      queryClient.invalidateQueries({ queryKey: ["saved-hustles-full"] });
      toast.success(isSaved ? "Removed from saved" : "Saved! ❤️");
    },
    onError: (err: any) => toast.error(err.message),
  });
};
