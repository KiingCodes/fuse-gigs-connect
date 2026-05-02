import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { sendNotification } from "@/hooks/useNotifications";

const LOCAL_KEY = "fg.knownAppVersion";

export const useCurrentAppVersion = () =>
  useQuery({
    queryKey: ["app-version-current"],
    queryFn: async () => {
      const { data } = await supabase
        .from("app_versions")
        .select("*")
        .eq("is_current", true)
        .order("released_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as { id: string; version: string; title: string; notes: string | null } | null;
    },
    staleTime: 1000 * 60 * 5,
  });

/**
 * Compares the current app version against what the user last saw locally.
 * If new — fires an in-app notification once and exposes a banner state.
 */
export const useVersionUpgradeBanner = () => {
  const { user } = useAuth();
  const { data: current } = useCurrentAppVersion();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!current) return;
    const known = localStorage.getItem(LOCAL_KEY);
    if (known !== current.version) {
      setShow(true);
      // Persist a notification so it shows in the bell as well
      if (user && known) {
        sendNotification({
          user_id: user.id,
          title: `New version available: v${current.version} 🎁`,
          body: current.title,
          type: "version_upgrade",
          reference_id: current.id,
        });
      }
    }
  }, [current, user]);

  const dismiss = () => {
    if (current) localStorage.setItem(LOCAL_KEY, current.version);
    setShow(false);
  };

  return { show, version: current, dismiss };
};
