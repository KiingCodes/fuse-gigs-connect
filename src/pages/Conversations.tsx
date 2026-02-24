import { useAuth } from "@/contexts/AuthContext";
import { useConversations } from "@/hooks/useChat";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Conversations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: conversations, isLoading } = useConversations();

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Messages" description="Your conversations on Fuse Gigs." path="/messages" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Messages</h1>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link key={conv.id} to={`/chat/${conv.id}`}>
                <Card className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/50 cursor-pointer">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarImage src={conv.other_user?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conv.other_user?.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground truncate">
                        {conv.other_user?.display_name || "Unknown User"}
                      </p>
                      {conv.last_message && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                      {(conv.unread_count ?? 0) > 0 && (
                        <Badge className="ml-2 shrink-0 bg-primary text-primary-foreground border-0 h-5 min-w-5 text-[10px]">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-lg text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground">Start a chat by contacting a hustler from their listing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
