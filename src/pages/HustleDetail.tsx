import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteHustle } from "@/hooks/useData";
import { useStartConversation } from "@/hooks/useChat";
import { useSavedHustleIds, useToggleSave } from "@/hooks/useSavedHustles";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import VerificationBadge from "@/components/VerificationBadge";
import HustleMap from "@/components/HustleMap";
import BookingModal from "@/components/BookingModal";
import ReviewSection from "@/components/ReviewSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, Phone, Mail, Globe, CalendarDays, Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { HustleWithDetails } from "@/hooks/useData";

const HustleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const deleteHustle = useDeleteHustle();
  const startConversation = useStartConversation();
  const [currentMedia, setCurrentMedia] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { data: savedIds } = useSavedHustleIds();
  const toggleSave = useToggleSave();
  const isSaved = savedIds?.has(id || "") ?? false;

  const { data: hustle, isLoading } = useQuery({
    queryKey: ["hustle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.user_id).single();
      return { ...data, profiles: profile } as unknown as HustleWithDetails;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (id && user && hustle && user.id !== hustle.user_id) {
      supabase.from("hustle_views").insert({ hustle_id: id, viewer_id: user.id }).then(() => {});
    }
  }, [id, user, hustle]);

  const handleStartChat = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!hustle) return;
    try {
      const conv = await startConversation.mutateAsync({ otherUserId: hustle.user_id, hustleId: hustle.id });
      navigate(`/chat/${conv.id}`);
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async () => {
    try {
      await deleteHustle.mutateAsync(id!);
      toast.success("Hustle deleted");
      navigate("/dashboard");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleShare = async () => {
    // Use published URL for sharing, not preview URL
    const shareUrl = `https://fusegigs.lovable.app/hustle/${id}`;
    if (navigator.share) {
      await navigator.share({ title: hustle?.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const media = hustle?.hustle_media?.sort((a, b) => a.display_order - b.display_order) || [];
  const profileData = hustle?.profiles as any;
  const categoryData = hustle?.hustle_categories as any;
  const isOwner = user && hustle && user.id === hustle.user_id;
  const hustleAny = hustle as any;

  const hustleJsonLd = hustle ? {
    "@context": "https://schema.org", "@type": "Service",
    name: hustle.title, description: hustle.description,
    provider: { "@type": "Person", name: profileData?.display_name || "Unknown" },
    areaServed: hustle.location || undefined,
    offers: hustle.price ? { "@type": "Offer", price: hustle.price, priceCurrency: "ZAR" } : undefined,
  } : undefined;

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

  if (!hustle) {
    return (
      <div className="min-h-screen bg-background">
        <SEO title="Hustle Not Found" path={`/hustle/${id}`} />
        <Navbar />
        <div className="container mx-auto py-20 text-center">
          <p className="text-lg text-muted-foreground">Hustle not found</p>
          <Link to="/"><Button variant="outline" className="mt-4">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={hustle.title} description={hustle.description.slice(0, 155)} path={`/hustle/${id}`} image={media[0]?.media_url} jsonLd={hustleJsonLd} />
      <Navbar />

      {/* Fullscreen Gallery Modal */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setGalleryOpen(false)}
          >
            <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10 text-3xl" onClick={() => setGalleryOpen(false)}>✕</button>
            {media.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setCurrentMedia(p => p > 0 ? p - 1 : media.length - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-sm transition-colors">
                  <ChevronLeft className="h-8 w-8 text-white" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setCurrentMedia(p => p < media.length - 1 ? p + 1 : 0); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 backdrop-blur-sm transition-colors">
                  <ChevronRight className="h-8 w-8 text-white" />
                </button>
              </>
            )}
            <motion.img
              key={currentMedia}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={media[currentMedia]?.media_url}
              alt=""
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {media.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentMedia(i); }} className={`h-2.5 w-2.5 rounded-full transition-all ${i === currentMedia ? "bg-white scale-125" : "bg-white/40"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex gap-2">
            {user && (
              <Button size="sm" variant="outline" className="gap-1" onClick={() => toggleSave.mutate({ hustleId: hustle.id, isSaved })}>
                <Heart className={`h-4 w-4 ${isSaved ? "text-destructive fill-destructive" : ""}`} />
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1" onClick={handleShare}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            {isOwner && (
              <>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/edit/${hustle.id}`)}>
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="gap-1"><Trash2 className="h-4 w-4" /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this hustle?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete "{hustle.title}".</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
            {/* Gallery Grid */}
            {media.length > 0 && (
              <div className="space-y-2">
                {media.length === 1 ? (
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted cursor-pointer group" onClick={() => { setCurrentMedia(0); setGalleryOpen(true); }}>
                    <img src={media[0].media_url} alt={hustle.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>
                ) : media.length === 2 ? (
                  <div className="grid grid-cols-2 gap-2 h-[340px]">
                    {media.slice(0, 2).map((m, i) => (
                      <div key={m.id} className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer group" onClick={() => { setCurrentMedia(i); setGalleryOpen(true); }}>
                        <img src={m.media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : media.length === 3 ? (
                  <div className="grid grid-cols-2 gap-2 h-[360px]">
                    <div className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer group row-span-2" onClick={() => { setCurrentMedia(0); setGalleryOpen(true); }}>
                      <img src={media[0].media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    {media.slice(1, 3).map((m, i) => (
                      <div key={m.id} className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer group" onClick={() => { setCurrentMedia(i + 1); setGalleryOpen(true); }}>
                        <img src={m.media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 h-[360px]">
                    <div className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer group col-span-2 row-span-2" onClick={() => { setCurrentMedia(0); setGalleryOpen(true); }}>
                      <img src={media[0].media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      {hustle.is_featured && (
                        <Badge className="absolute left-3 top-3 bg-[hsl(45,93%,47%)] text-black border-0 gap-1 shadow-md">
                          <Star className="h-3 w-3" /> Featured
                        </Badge>
                      )}
                    </div>
                    {media.slice(1, 5).map((m, i) => (
                      <div key={m.id} className="relative overflow-hidden rounded-2xl bg-muted cursor-pointer group" onClick={() => { setCurrentMedia(i + 1); setGalleryOpen(true); }}>
                        <img src={m.media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        {i === 3 && media.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">+{media.length - 5}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                {categoryData && <Badge variant="outline" className="font-medium">{categoryData.name}</Badge>}
                {hustle.is_available_now && <Badge className="bg-success text-success-foreground border-0 text-xs"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-success-foreground animate-pulse" /> Available Now</Badge>}
              </div>
              <h1 className="mb-3 text-3xl font-extrabold text-foreground tracking-tight">{hustle.title}</h1>
              {hustle.location && (
                <div className="mb-4 flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" /> {hustle.location}
                </div>
              )}
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-[15px]">{hustle.description}</p>

              {(hustleAny.contact_phone || hustleAny.contact_email || hustleAny.website_url) && (
                <div className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-5">
                  <h3 className="font-semibold text-foreground text-sm">Contact Information</h3>
                  {hustleAny.contact_phone && (
                    <a href={`tel:${hustleAny.contact_phone}`} className="flex items-center gap-2.5 text-sm text-primary hover:underline">
                      <div className="rounded-lg bg-primary/10 p-2"><Phone className="h-4 w-4 text-primary" /></div> {hustleAny.contact_phone}
                    </a>
                  )}
                  {hustleAny.contact_email && (
                    <a href={`mailto:${hustleAny.contact_email}`} className="flex items-center gap-2.5 text-sm text-primary hover:underline">
                      <div className="rounded-lg bg-primary/10 p-2"><Mail className="h-4 w-4 text-primary" /></div> {hustleAny.contact_email}
                    </a>
                  )}
                  {hustleAny.website_url && (
                    <a href={hustleAny.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-primary hover:underline">
                      <div className="rounded-lg bg-primary/10 p-2"><Globe className="h-4 w-4 text-primary" /></div> {hustleAny.website_url}
                    </a>
                  )}
                </div>
              )}

              {hustle.latitude && hustle.longitude && (
                <div className="mt-6">
                  <h3 className="mb-2 font-semibold text-foreground text-sm">Location</h3>
                  <div className="rounded-2xl overflow-hidden">
                    <HustleMap hustles={[hustle]} userLocation={null} className="h-[250px]" />
                  </div>
                </div>
              )}

              <ReviewSection hustleId={hustle.id} hustleOwnerId={hustle.user_id} />
            </motion.div>
          </motion.div>

          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
            <Card className="shadow-elevated rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                {hustle.price ? (
                  <div className="mb-5">
                    <p className="text-4xl font-extrabold text-foreground tracking-tight">
                      R{hustle.price}
                      {hustle.price_type === "hourly" && <span className="text-lg font-normal text-muted-foreground">/hr</span>}
                    </p>
                    {hustle.price_type === "negotiable" && <p className="text-sm text-muted-foreground mt-1">Price is negotiable</p>}
                  </div>
                ) : (
                  <p className="mb-5 text-lg font-medium text-muted-foreground">Contact for pricing</p>
                )}
                {user && user.id !== hustle.user_id && (
                  <div className="space-y-2.5">
                    <Button onClick={handleStartChat} className="w-full gradient-primary text-primary-foreground gap-2 h-11 font-semibold" disabled={startConversation.isPending}>
                      <MessageSquare className="h-4 w-4" /> {startConversation.isPending ? "Starting..." : "Chat with Hustler"}
                    </Button>
                    <Button onClick={() => setBookingOpen(true)} variant="outline" className="w-full gap-2 h-11 font-semibold">
                      <CalendarDays className="h-4 w-4" /> Book Now
                    </Button>
                  </div>
                )}
                {!user && (
                  <Link to="/auth">
                    <Button className="w-full gradient-primary text-primary-foreground h-11 font-semibold">Sign in to contact</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                    <AvatarImage src={profileData?.avatar_url || ""} alt={profileData?.display_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                      {profileData?.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground">{profileData?.display_name || "Unknown"}</p>
                      <VerificationBadge level={profileData?.verification_level ?? 0} showLabel />
                    </div>
                    {profileData?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {profileData.location}
                      </p>
                    )}
                  </div>
                </div>
                {profileData?.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{profileData.bio}</p>}
                {profileData?.response_time_minutes && (
                  <p className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 inline-block">⚡ Typically responds in {profileData.response_time_minutes} min</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {user && hustle && user.id !== hustle.user_id && (
          <BookingModal
            open={bookingOpen}
            onClose={() => setBookingOpen(false)}
            hustleId={hustle.id}
            hustlerId={hustle.user_id}
            hustleTitle={hustle.title}
            hustlePrice={hustle.price}
          />
        )}
      </div>
    </div>
  );
};

export default HustleDetail;
