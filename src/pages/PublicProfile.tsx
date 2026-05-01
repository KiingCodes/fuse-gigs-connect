import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStartConversation } from "@/hooks/useChat";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HustleCard from "@/components/HustleCard";
import VerificationBadge from "@/components/VerificationBadge";
import GuarantorBadge from "@/components/GuarantorBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, MessageSquare, Share2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { buildShareUrl, shareLink } from "@/lib/share";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package } from "lucide-react";

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const startConversation = useStartConversation();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId!).single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId,
  });

  const { data: hustles } = useQuery({
    queryKey: ["public-profile-hustles", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("user_id", userId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return (data || []).map((h: any) => ({ ...h, profiles: profile })) as any[];
    },
    enabled: !!userId && !!profile,
  });

  const { data: products } = useQuery({
    queryKey: ["public-profile-products", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!userId,
  });

  const handleShare = async () => {
    const url = buildShareUrl(`/u/${userId}`);
    await shareLink({
      url,
      title: profile?.display_name ? `${profile.display_name} on Fuse Gigs` : "Fuse Gigs profile",
      text: profile?.bio || "Check out this hustler on Fuse Gigs!",
      toastSuccess: toast.success,
      toastError: toast.error,
    });
  };

  const handleChat = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!userId || user.id === userId) return;
    try {
      const conv = await startConversation.mutateAsync({ otherUserId: userId });
      navigate(`/chat/${conv.id}`);
    } catch (err: any) { toast.error(err.message); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Profile not found" path={`/u/${userId}`} />
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <p className="text-lg text-muted-foreground">Profile not found</p>
          <Link to="/"><Button variant="outline" className="mt-4">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const isMe = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${profile.display_name || "Hustler"} • Fuse Gigs`}
        description={profile.bio || `View ${profile.display_name || "this hustler"}'s services on Fuse Gigs.`}
        path={`/u/${userId}`}
        image={profile.avatar_url || undefined}
      />
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden rounded-3xl border-0 shadow-elevated">
            <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-orange-500" />
            <CardContent className="relative px-6 pb-6 pt-0">
              <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-orange-500 text-3xl font-bold text-primary-foreground">
                      {profile.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-extrabold text-foreground">{profile.display_name || "Hustler"}</h1>
                      <VerificationBadge level={profile.verification_level ?? 0} showLabel />
                    </div>
                    {profile.location && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {profile.location}
                      </p>
                    )}
                    <div className="mt-2"><GuarantorBadge hustlerId={userId!} /></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleShare}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                  {!isMe && user && (
                    <Button size="sm" className="gap-1 gradient-primary text-primary-foreground" onClick={handleChat}>
                      <MessageSquare className="h-4 w-4" /> Message
                    </Button>
                  )}
                  {!isMe && profile.phone && (
                    <a href={`tel:${profile.phone}`}>
                      <Button variant="outline" size="sm" className="gap-1"><Phone className="h-4 w-4" /> Call</Button>
                    </a>
                  )}
                </div>
              </div>
              {profile.bio && <p className="mt-4 text-sm text-foreground/80 leading-relaxed">{profile.bio}</p>}
              <div className="mt-4 flex gap-3 text-sm">
                <Badge variant="outline" className="gap-1">{hustles?.length ?? 0} hustles</Badge>
                <Badge variant="outline" className="gap-1">{products?.length ?? 0} products</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="hustles" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 max-w-sm">
            <TabsTrigger value="hustles">Hustles</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>
          <TabsContent value="hustles" className="mt-6">
            {hustles && hustles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {hustles.map((h) => <HustleCard key={h.id} hustle={h as any} />)}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">No active hustles yet.</div>
            )}
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            {products && products.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p: any) => (
                  <Card key={p.id} className="overflow-hidden rounded-2xl">
                    <div className="aspect-square bg-muted">
                      {p.media_url ? (
                        <img src={p.media_url} alt={p.title} className="h-full w-full object-cover" loading="lazy" />
                      ) : <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-muted-foreground/30" /></div>}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm line-clamp-1">{p.title}</p>
                      <p className="text-primary font-bold text-sm mt-0.5">R{p.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground">No products listed yet.</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PublicProfile;
