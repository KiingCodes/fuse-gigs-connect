import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useData";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Image as ImageIcon, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Community = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["community-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      // Fetch profiles for all users
      const userIds = [...new Set((data || []).map((m: any) => m.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((m: any) => ({ ...m, profile: profileMap.get(m.user_id) }));
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("community-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["community-messages"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, mediaUrl, messageType }: { content?: string; mediaUrl?: string; messageType?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("community_messages").insert({
        user_id: user.id,
        content: content || null,
        media_url: mediaUrl || null,
        message_type: messageType || "text",
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-messages"] }),
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from("community_messages").delete().eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["community-messages"] }),
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Community Chat</h2>
          <p className="text-muted-foreground mb-6">Sign in to join the conversation</p>
          <Link to="/auth"><Button className="gradient-primary text-primary-foreground">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage.mutateAsync({ content: text.trim() });
      setText("");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop();
      const path = `community/${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hustle-media").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hustle-media").getPublicUrl(path);
      await sendMessage.mutateAsync({ content: "📷 Image", mediaUrl: urlData.publicUrl, messageType: "image" });
    } catch (err: any) { toast.error(err.message); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Community Chat" path="/community" />
      <Navbar />

      {/* Header */}
      <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="container mx-auto max-w-2xl flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">Community Chat</p>
            <p className="text-xs text-muted-foreground">Share services, ask questions, connect</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-2xl px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : messages && messages.length > 0 ? (
            <AnimatePresence>
              {messages.map((msg: any) => {
                const isMine = msg.user_id === user.id;
                const msgProfile = msg.profile;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
                  >
                    {!isMine && (
                      <Avatar className="h-7 w-7 shrink-0 mt-1">
                        <AvatarImage src={msgProfile?.avatar_url || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                          {msgProfile?.display_name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                      {!isMine && (
                        <p className="text-[11px] font-semibold mb-0.5 opacity-80">{msgProfile?.display_name || "User"}</p>
                      )}
                      {msg.message_type === "image" && msg.media_url && (
                        <img src={msg.media_url} alt="" className="mb-1 rounded-lg max-h-48 object-cover" />
                      )}
                      {msg.content && msg.content !== "📷 Image" && (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                        {isMine && (
                          <button onClick={() => deleteMessage.mutate(msg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className={`h-3 w-3 ${isMine ? "text-primary-foreground/40 hover:text-primary-foreground/80" : "text-muted-foreground"}`} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <p className="py-20 text-center text-sm text-muted-foreground">Be the first to say something! 👋</p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3">
        <div className="container mx-auto max-w-2xl flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSend} className="hidden" />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Share with the community..."
            className="flex-1"
          />
          <Button size="icon" className="gradient-primary text-primary-foreground shrink-0" onClick={handleSend} disabled={!text.trim() || sendMessage.isPending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Community;
