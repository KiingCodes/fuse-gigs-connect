import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface HustleCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface Hustle {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category_id: string | null;
  price: number | null;
  price_type: string | null;
  location: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HustleMedia {
  id: string;
  hustle_id: string;
  media_url: string;
  media_type: string | null;
  display_order: number;
  created_at: string;
}

export interface HustleWithDetails extends Hustle {
  profiles?: Profile;
  hustle_categories?: HustleCategory;
  hustle_media?: HustleMedia[];
}

export const useProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("hustle_categories").select("*").order("name");
      if (error) throw error;
      return data as HustleCategory[];
    },
  });
};

export const useHustles = (categoryId?: string, search?: string) => {
  return useQuery({
    queryKey: ["hustles", categoryId, search],
    queryFn: async () => {
      let query = supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (categoryId) query = query.eq("category_id", categoryId);
      if (search) query = query.ilike("title", `%${search}%`);

      const { data, error } = await query;
      if (error) throw error;
      const userIds = [...new Set((data || []).map(h => h.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return (data || []).map(h => ({ ...h, profiles: profileMap.get(h.user_id) })) as unknown as HustleWithDetails[];
    },
  });
};

export const useFeaturedHustles = () => {
  return useQuery({
    queryKey: ["hustles", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      const userIds = [...new Set((data || []).map(h => h.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      return (data || []).map(h => ({ ...h, profiles: profileMap.get(h.user_id) })) as unknown as HustleWithDetails[];
    },
  });
};

export const useMyHustles = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-hustles", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HustleWithDetails[];
    },
    enabled: !!user,
  });
};

export const useCreateHustle = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (hustle: { title: string; description: string; category_id: string; price: number | null; price_type: string; location: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("hustles")
        .insert({ ...hustle, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hustles"] });
      queryClient.invalidateQueries({ queryKey: ["my-hustles"] });
    },
  });
};

export const useUploadHustleMedia = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ hustleId, files }: { hustleId: string; files: File[] }) => {
      if (!user) throw new Error("Not authenticated");
      const results = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${hustleId}/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("hustle-media")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("hustle-media").getPublicUrl(path);

        const { error: dbError } = await supabase.from("hustle_media").insert({
          hustle_id: hustleId,
          media_url: urlData.publicUrl,
          media_type: file.type.startsWith("video") ? "video" : "image",
          display_order: i,
        });
        if (dbError) throw dbError;
        results.push(urlData.publicUrl);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hustles"] });
      queryClient.invalidateQueries({ queryKey: ["my-hustles"] });
    },
  });
};

export const useDashboardStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: hustles } = await supabase
        .from("hustles")
        .select("id")
        .eq("user_id", user.id);

      const hustleIds = hustles?.map((h) => h.id) || [];

      let totalViews = 0;
      let totalInquiries = 0;

      if (hustleIds.length > 0) {
        const { count: viewCount } = await supabase
          .from("hustle_views")
          .select("*", { count: "exact", head: true })
          .in("hustle_id", hustleIds);
        totalViews = viewCount || 0;

        const { count: inquiryCount } = await supabase
          .from("hustle_inquiries")
          .select("*", { count: "exact", head: true })
          .in("hustle_id", hustleIds);
        totalInquiries = inquiryCount || 0;
      }

      return {
        totalHustles: hustleIds.length,
        totalViews,
        totalInquiries,
        activeHustles: hustleIds.length,
      };
    },
    enabled: !!user,
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("user_id", user.id);
      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
