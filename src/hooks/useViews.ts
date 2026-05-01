import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductViewCount = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["product-views", productId],
    queryFn: async () => {
      if (!productId) return 0;
      const { count } = await supabase
        .from("product_views")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);
      return count ?? 0;
    },
    enabled: !!productId,
    staleTime: 60_000,
  });
};

export const useHustleViewCount = (hustleId: string | undefined) => {
  return useQuery({
    queryKey: ["hustle-views-count", hustleId],
    queryFn: async () => {
      if (!hustleId) return 0;
      const { count } = await supabase
        .from("hustle_views")
        .select("*", { count: "exact", head: true })
        .eq("hustle_id", hustleId);
      return count ?? 0;
    },
    enabled: !!hustleId,
    staleTime: 60_000,
  });
};

export const trackProductView = async (productId: string, viewerId: string | null, ownerId: string) => {
  if (!viewerId || viewerId === ownerId) return;
  await supabase.from("product_views").insert({ product_id: productId, viewer_id: viewerId });
};
