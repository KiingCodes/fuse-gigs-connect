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
import { Send, Image as ImageIcon, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import VoiceRecorder from "@/components/VoiceRecorder";
import Lightbox from "@/components/Lightbox";
import { Link } from "react-router-dom";

const Community = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; type: "image" | "video" | "audio" } | null>(null);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["community-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      const userIds = [...new Set((data || []).map((m: any) => m.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((m: any) => ({ ...m, profile: profileMap.get(m.user_id) }));
    },
    enabled: !!user,
  });

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["community-messages"] }); toast.success("Deleted"); },
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

  const uploadAndSend = async (file: File | Blob, ext: string, messageType: "image" | "voice" | "video", caption?: string) => {
    setUploading(true);
    try {
      const path = `community/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("hustle-media").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("hustle-media").getPublicUrl(path);
      await sendMessage.mutateAsync({ content: caption || null, mediaUrl: urlData.publicUrl, messageType });
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleSend = async () => {
    if (pendingFile) {
      const ext = pendingFile.name.split(".").pop() || "jpg";
      const isVideo = pendingFile.type.startsWith("video/");
      await uploadAndSend(pendingFile, ext, isVideo ? "video" : "image", text.trim() || undefined);
      setPendingFile(null); setPendingPreview(null); setText("");
      return;
    }
    if (!text.trim()) return;
    try {
      await sendMessage.mutateAsync({ content: text.trim() });
      setText("");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleVoice = async (blob: Blob) => {
    await uploadAndSend(blob, "webm", "voice");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Community Chat" path="/community" />
      <Navbar />

      <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="container mx-auto max-w-2xl flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2"><Users className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="font-semibold text-foreground text-sm">Community Chat</p>
            <p className="text-xs text-muted-foreground">Share services, ask questions, connect</p>
          </div>
        </div>
      </div>

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
                    className={`group flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}
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
                        <button onClick={() => setLightbox({ src: msg.media_url, type: "image" })} className="block">
                          <img src={msg.media_url} alt="" className="mb-1 rounded-lg max-h-56 object-cover hover:opacity-90 transition" />
                        </button>
                      )}
                      {msg.message_type === "video" && msg.media_url && (
                        <button onClick={() => setLightbox({ src: msg.media_url, type: "video" })} className="block">
                          <video src={msg.media_url} className="mb-1 rounded-lg max-h-56" />
                        </button>
                      )}
                      {msg.message_type === "voice" && msg.media_url && (
                        <audio src={msg.media_url} controls className="mb-1 max-w-full h-10" />
                      )}
                      {msg.content && (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {format(new Date(msg.created_at), "HH:mm")}
                        </p>
                        {isMine && (
                          <button
                            onClick={() => { if (confirm("Delete this message?")) deleteMessage.mutate(msg.id); }}
                            className="opacity-60 hover:opacity-100 transition"
                            aria-label="Delete message"
                          >
                            <Trash2 className={`h-3 w-3 ${isMine ? "text-primary-foreground" : "text-muted-foreground"}`} />
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

      {/* Pending media preview */}
      {pendingPreview && (
        <div className="border-t border-border bg-muted/40 px-4 py-2">
          <div className="container mx-auto max-w-2xl flex items-center gap-3">
            {pendingFile?.type.startsWith("video/") ? (
              <video src={pendingPreview} className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <img src={pendingPreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{pendingFile?.name}</p>
              <p className="text-[10px] text-muted-foreground">Add a caption below, then tap send</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setPendingFile(null); setPendingPreview(null); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}>
        <div className="container mx-auto max-w-2xl flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFilePick} className="hidden" />
          <VoiceRecorder onRecorded={handleVoice} disabled={uploading || !!pendingFile} />
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={pendingFile ? "Add a caption..." : "Share with the community..."}
            className="flex-1"
          />
          <Button
            size="icon"
            className="gradient-primary text-primary-foreground shrink-0"
            onClick={handleSend}
            disabled={(!text.trim() && !pendingFile) || sendMessage.isPending || uploading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {lightbox && (
        <Lightbox open={!!lightbox} onClose={() => setLightbox(null)} src={lightbox.src} type={lightbox.type} />
      )}
    </div>
  );
};

export default Community;
