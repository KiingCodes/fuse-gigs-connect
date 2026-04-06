import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { notifyBoostActivated } from "@/hooks/useNotifications";

export interface BoostPackage {
  id: string;
  name: string;
  duration_days: number;
  price_cents: number;
  currency: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface HustleBoost {
  id: string;
  hustle_id: string;
  user_id: string;
  package_id: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  amount_cents: number;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  updated_at: string;
  // joined
  boost_packages?: Partial<BoostPackage>;
  hustles?: { id: string; title: string };
  profiles?: { display_name: string | null; avatar_url: string | null };
}

export interface BoostAnalyticsSummary {
  views: number;
  clicks: number;
  inquiries: number;
}

// Fetch available boost packages
export const useBoostPackages = () => {
  return useQuery({
    queryKey: ["boost-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("boost_packages")
        .select("*")
        .eq("is_active", true)
        .order("price_cents", { ascending: true });
      if (error) throw error;
      return data as BoostPackage[];
    },
  });
};

// Fetch active boost IDs for displaying badges
export const useActiveBoostedHustleIds = () => {
  return useQuery({
    queryKey: ["active-boosted-hustle-ids"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hustle_boosts")
        .select("hustle_id")
        .eq("status", "active")
        .gt("ends_at", new Date().toISOString());
      if (error) throw error;
      return new Set((data || []).map((b) => b.hustle_id));
    },
    staleTime: 60000,
  });
};

// Current user's boosts
export const useMyBoosts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-boosts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("hustle_boosts")
        .select("*, boost_packages(name, duration_days, price_cents, currency)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as HustleBoost[];
    },
    enabled: !!user,
  });
};

// Request a boost (manual payment — status stays 'pending')
export const useRequestBoost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ hustleId, packageId, amountCents }: { hustleId: string; packageId: string; amountCents: number }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("hustle_boosts")
        .insert({
          hustle_id: hustleId,
          user_id: user.id,
          package_id: packageId,
          amount_cents: amountCents,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-boosts"] });
    },
  });
};

// Boost analytics for a specific boost
export const useBoostAnalytics = (boostId?: string) => {
  return useQuery({
    queryKey: ["boost-analytics", boostId],
    queryFn: async () => {
      if (!boostId) return { views: 0, clicks: 0, inquiries: 0 } as BoostAnalyticsSummary;
      const { data, error } = await supabase
        .from("boost_analytics")
        .select("event_type")
        .eq("boost_id", boostId);
      if (error) throw error;
      const events = data || [];
      return {
        views: events.filter((e) => e.event_type === "view").length,
        clicks: events.filter((e) => e.event_type === "click").length,
        inquiries: events.filter((e) => e.event_type === "inquiry").length,
      } as BoostAnalyticsSummary;
    },
    enabled: !!boostId,
  });
};

// Admin: all boosts
export const useAllBoosts = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["admin-boosts", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("hustle_boosts")
        .select("*, boost_packages(name, duration_days, price_cents, currency)")
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;

      // Fetch related hustles and profiles
      const hustleIds = [...new Set((data || []).map((b) => b.hustle_id))];
      const userIds = [...new Set((data || []).map((b) => b.user_id))];

      const [{ data: hustles }, { data: profiles }] = await Promise.all([
        supabase.from("hustles").select("id, title").in("id", hustleIds.length > 0 ? hustleIds : ["_"]),
        supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", userIds.length > 0 ? userIds : ["_"]),
      ]);

      const hustleMap = new Map((hustles || []).map((h) => [h.id, h]));
      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      return (data || []).map((b) => ({
        ...b,
        hustles: hustleMap.get(b.hustle_id),
        profiles: profileMap.get(b.user_id),
      })) as HustleBoost[];
    },
  });
};

// Admin: approve/reject boost
export const useAdminUpdateBoost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ boostId, status, durationDays }: { boostId: string; status: "active" | "rejected" | "expired"; durationDays?: number }) => {
      const updates: Record<string, any> = { status };
      if (status === "active" && durationDays) {
        const now = new Date();
        updates.starts_at = now.toISOString();
        updates.ends_at = new Date(now.getTime() + durationDays * 86400000).toISOString();
      }
      const { data, error } = await supabase
        .from("hustle_boosts")
        .update(updates)
        .eq("id", boostId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-boosts"] });
      queryClient.invalidateQueries({ queryKey: ["active-boosted-hustle-ids"] });
      queryClient.invalidateQueries({ queryKey: ["my-boosts"] });
    },
  });
};

// Track boost event
export const useTrackBoostEvent = () => {
  return useMutation({
    mutationFn: async ({ boostId, hustleId, eventType }: { boostId: string; hustleId: string; eventType: "view" | "click" | "inquiry" }) => {
      const { error } = await supabase
        .from("boost_analytics")
        .insert({ boost_id: boostId, hustle_id: hustleId, event_type: eventType });
      if (error) throw error;
    },
  });
};
