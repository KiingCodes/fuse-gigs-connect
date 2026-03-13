import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const usePushNotifications = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !("Notification" in window)) return;

    // Request permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    // Listen to realtime notifications
    const channel = supabase
      .channel("push-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          const notif = payload.new;
          if (notif && document.hidden) {
            try {
              new Notification(notif.title || "Fuse Gigs", {
                body: notif.body || "",
                icon: "/pwa-icon-192.png",
                badge: "/pwa-icon-192.png",
                tag: notif.id,
              });
            } catch {
              // SW notifications not available in all contexts
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};
