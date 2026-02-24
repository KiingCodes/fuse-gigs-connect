import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages, useSendMessage, useMarkRead } from "@/hooks/useChat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Chat = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();

  // Get conversation details
  const { data: conversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId!)
        .single();
      if (error) throw error;
      const otherId = data.participant_1 === user!.id ? data.participant_2 : data.participant_1;
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", otherId).single();
      return { ...data, other_user: profile };
    },
    enabled: !!conversationId && !!user,
  });

  // Mark as read on open
  useEffect(() => {
    if (conversationId && user) {
      markRead.mutate(conversationId);
    }
  }, [conversationId, user, messages?.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSend = async () => {
    if (!text.trim() || !conversationId) return;
    try {
      await sendMessage.mutateAsync({ conversationId, content: text.trim() });
      setText("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${conversationId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("hustle-media").upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("hustle-media").getPublicUrl(path);
      await sendMessage.mutateAsync({ conversationId, content: "📷 Image", messageType: "image", mediaUrl: urlData.publicUrl });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const otherUser = conversation?.other_user as any;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title={`Chat with ${otherUser?.display_name || "User"}`} path={`/chat/${conversationId}`} />
      <Navbar />

      {/* Chat Header */}
      <div className="sticky top-16 z-40 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
        <div className="container mx-auto max-w-2xl flex items-center gap-3">
          <Link to="/messages">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={otherUser?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {otherUser?.display_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{otherUser?.display_name || "User"}</p>
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
            messages.map((msg) => {
              const isMine = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"}`}>
                    {msg.message_type === "image" && msg.media_url && (
                      <img src={msg.media_url} alt="Shared image" className="mb-1 rounded-lg max-h-48 object-cover" />
                    )}
                    {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-20 text-center text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
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
            placeholder="Type a message..."
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

export default Chat;
