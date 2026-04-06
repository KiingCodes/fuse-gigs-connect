import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useIsAdmin = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      if (error) return false;
      return (data?.length ?? 0) > 0;
    },
    enabled: !!user,
  });
};

export interface VerificationRequestWithProfile {
  id: string;
  user_id: string;
  level: number;
  status: string;
  phone: string | null;
  id_document_url: string | null;
  selfie_url: string | null;
  business_reg_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
    email?: string;
    verification_level: number;
  };
}

export const useAllVerificationRequests = (statusFilter?: string) => {
  return useQuery({
    queryKey: ["admin-verification-requests", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("verification_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for each request
      const userIds = [...new Set((data || []).map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, verification_level")
        .in("user_id", userIds.length > 0 ? userIds : ["_"]);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      // Generate signed URLs for private verification docs
      const results = await Promise.all(
        (data || []).map(async (r) => {
          const getSignedUrl = async (path: string | null) => {
            if (!path) return null;
            // If it's already a full URL, return as-is
            if (path.startsWith("http")) return path;
            const { data: signedData } = await supabase.storage
              .from("verification-docs")
              .createSignedUrl(path, 3600); // 1 hour
            return signedData?.signedUrl || null;
          };

          const [id_document_url, selfie_url, business_reg_url] = await Promise.all([
            getSignedUrl(r.id_document_url),
            getSignedUrl(r.selfie_url),
            getSignedUrl(r.business_reg_url),
          ]);

          return {
            ...r,
            id_document_url,
            selfie_url,
            business_reg_url,
            profiles: profileMap.get(r.user_id),
          };
        })
      );

      return results as VerificationRequestWithProfile[];
    },
  });
};

export const useReviewVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      userId,
      status,
      level,
      adminNotes,
    }: {
      requestId: string;
      userId: string;
      status: "approved" | "rejected";
      level: number;
      adminNotes?: string;
    }) => {
      // Update the request status
      const { error: reqError } = await supabase
        .from("verification_requests")
        .update({ status, admin_notes: adminNotes || null })
        .eq("id", requestId);
      if (reqError) throw reqError;

      // If approved, update the user's verification level
      if (status === "approved") {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ verification_level: level })
          .eq("user_id", userId);
        if (profileError) throw profileError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-verification-requests"] });
    },
  });
};
