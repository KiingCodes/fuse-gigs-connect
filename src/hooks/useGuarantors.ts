import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sendNotification } from "@/hooks/useNotifications";

export interface Guarantor {
  id: string;
  hustler_id: string;
  guarantor_id: string;
  status: string;
  created_at: string;
  guarantor_profile?: { display_name: string | null; avatar_url: string | null; verification_level: number };
}

export const useGuarantors = (hustlerId: string | undefined) => {
  return useQuery({
    queryKey: ["guarantors", hustlerId],
    queryFn: async () => {
      if (!hustlerId) return [];
      const { data, error } = await supabase
        .from("guarantors")
        .select("*")
        .eq("hustler_id", hustlerId);
      if (error) throw error;

      // Fetch guarantor profiles
      const ids = (data || []).map((g: any) => g.guarantor_id);
      if (ids.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, verification_level")
        .in("user_id", ids);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((g: any) => ({
        ...g,
        guarantor_profile: profileMap.get(g.guarantor_id),
      })) as Guarantor[];
    },
    enabled: !!hustlerId,
  });
};

export const useApprovedGuarantorCount = (hustlerId: string | undefined) => {
  const { data: guarantors } = useGuarantors(hustlerId);
  return guarantors?.filter((g) => g.status === "approved").length ?? 0;
};

export const useRequestGuarantor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (guarantorId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("guarantors")
        .insert({ hustler_id: user.id, guarantor_id: guarantorId })
        .select()
        .single();
      if (error) throw error;

      // Notify the guarantor
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();
      sendNotification({
        user_id: guarantorId,
        title: "Guarantor Request 🤝",
        body: `${profile?.display_name || "Someone"} wants you to vouch for them on Fuse Gigs.`,
        type: "guarantor_request",
        reference_id: data.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guarantors"] });
    },
  });
};

export const useRespondToGuarantor = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("guarantors")
        .update({ status })
        .eq("id", id)
        .eq("guarantor_id", user.id);
      if (error) throw error;

      // Notify the hustler
      const { data: guarantorRow } = await supabase
        .from("guarantors")
        .select("hustler_id")
        .eq("id", id)
        .single();
      if (guarantorRow) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        sendNotification({
          user_id: guarantorRow.hustler_id,
          title: status === "approved" ? "Guarantor Approved ✅" : "Guarantor Declined ❌",
          body: `${profile?.display_name || "A user"} ${status === "approved" ? "is now vouching for you!" : "declined your guarantor request."}`,
          type: "guarantor_response",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guarantors"] });
    },
  });
};

export const useRemoveGuarantor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("guarantors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guarantors"] });
    },
  });
};

export const useMyGuarantorRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["guarantor-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("guarantors")
        .select("*")
        .eq("guarantor_id", user.id)
        .eq("status", "pending");
      if (error) throw error;

      const hustlerIds = (data || []).map((g: any) => g.hustler_id);
      if (hustlerIds.length === 0) return [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", hustlerIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      return (data || []).map((g: any) => ({
        ...g,
        hustler_profile: profileMap.get(g.hustler_id),
      }));
    },
    enabled: !!user,
  });
};
