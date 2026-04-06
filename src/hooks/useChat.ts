import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { notifyNewMessage } from "@/hooks/useNotifications";

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  hustle_id: string | null;
  created_at: string;
  updated_at: string;
  other_user?: { display_name: string | null; avatar_url: string | null; user_id: string };
  last_message?: Message | null;
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      if (error) throw error;

      const otherIds = (data || []).map((c: any) => c.participant_1 === user.id ? c.participant_2 : c.participant_1);
      const uniqueIds = [...new Set(otherIds)];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", uniqueIds.length > 0 ? uniqueIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      // Get last messages
      const convIds = (data || []).map((c: any) => c.id);
      let lastMessages: any[] = [];
      if (convIds.length > 0) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: false });
        lastMessages = msgs || [];
      }

      // Get unread counts
      return (data || []).map((c: any) => {
        const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const convMessages = lastMessages.filter((m: any) => m.conversation_id === c.id);
        return {
          ...c,
          other_user: profileMap.get(otherId),
          last_message: convMessages[0] || null,
          unread_count: convMessages.filter((m: any) => !m.is_read && m.sender_id !== user.id).length,
        };
      }) as Conversation[];
    },
    enabled: !!user,
  });
};

export const useMessages = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient]);

  return query;
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ conversationId, content, messageType = "text", mediaUrl }: { conversationId: string; content?: string; messageType?: string; mediaUrl?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        media_url: mediaUrl,
      }).select().single();
      if (error) throw error;
      // Update conversation timestamp
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

      // Notify the other participant
      const { data: conv } = await supabase.from("conversations").select("participant_1, participant_2").eq("id", conversationId).single();
      if (conv) {
        const recipientId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        const { data: senderProfile } = await supabase.from("profiles").select("display_name").eq("user_id", user.id).single();
        notifyNewMessage(recipientId, senderProfile?.display_name || "Someone", conversationId);
      }

      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useStartConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ otherUserId, hustleId }: { otherUserId: string; hustleId?: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`)
        .maybeSingle();
      
      if (existing) return existing;

      const { data, error } = await supabase.from("conversations").insert({
        participant_1: user.id,
        participant_2: otherUserId,
        hustle_id: hustleId || null,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};
