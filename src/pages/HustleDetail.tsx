import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteHustle } from "@/hooks/useData";
import { useStartConversation } from "@/hooks/useChat";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import VerificationBadge from "@/components/VerificationBadge";
import HustleMap from "@/components/HustleMap";
import BookingModal from "@/components/BookingModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, MessageSquare, ArrowLeft, ChevronLeft, ChevronRight, Pencil, Trash2, Phone, Mail, Globe, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteHustle.mutateAsync(id!);
      toast.success("Hustle deleted");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const media = hustle?.hustle_media?.sort((a, b) => a.display_order - b.display_order) || [];
  const profileData = hustle?.profiles as any;
  const categoryData = hustle?.hustle_categories as any;
  const isOwner = user && hustle && user.id === hustle.user_id;
  const hustleAny = hustle as any;

  const hustleJsonLd = hustle ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: hustle.title,
    description: hustle.description,
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
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          {isOwner && (
            <div className="flex gap-2">
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
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            {media.length > 0 && (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
                  {media[currentMedia]?.media_type === "video" ? (
                    <video src={media[currentMedia].media_url} className="h-full w-full object-cover" controls />
                  ) : (
                    <img src={media[currentMedia]?.media_url} alt={hustle.title} className="h-full w-full object-cover" loading="lazy" />
                  )}
                  {media.length > 1 && (
                    <>
                      <button onClick={() => setCurrentMedia((p) => (p > 0 ? p - 1 : media.length - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={() => setCurrentMedia((p) => (p < media.length - 1 ? p + 1 : 0))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur-sm hover:bg-background transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {hustle.is_featured && (
                    <Badge className="absolute left-3 top-3 gradient-premium text-premium-foreground border-0 gap-1">
                      <Star className="h-3 w-3" /> Featured
                    </Badge>
                  )}
                </div>
                {media.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {media.map((m, i) => (
                      <button key={m.id} onClick={() => setCurrentMedia(i)} className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-colors ${i === currentMedia ? "border-primary" : "border-transparent"}`}>
                        {m.media_type === "video" ? (
                          <video src={m.media_url} className="h-full w-full object-cover" />
                        ) : (
                          <img src={m.media_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center gap-2">
                {categoryData && <Badge variant="outline">{categoryData.name}</Badge>}
                {hustle.is_available_now && <Badge className="bg-success text-success-foreground border-0 text-xs">Available Now</Badge>}
              </div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">{hustle.title}</h1>
              {hustle.location && (
                <div className="mb-4 flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {hustle.location}
                </div>
              )}
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{hustle.description}</p>

              {/* Contact Info */}
              {(hustleAny.contact_phone || hustleAny.contact_email || hustleAny.website_url) && (
                <div className="mt-6 space-y-2 rounded-lg border border-border p-4">
                  <h3 className="font-semibold text-foreground text-sm">Contact Information</h3>
                  {hustleAny.contact_phone && (
                    <a href={`tel:${hustleAny.contact_phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Phone className="h-4 w-4" /> {hustleAny.contact_phone}
                    </a>
                  )}
                  {hustleAny.contact_email && (
                    <a href={`mailto:${hustleAny.contact_email}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Mail className="h-4 w-4" /> {hustleAny.contact_email}
                    </a>
                  )}
                  {hustleAny.website_url && (
                    <a href={hustleAny.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Globe className="h-4 w-4" /> {hustleAny.website_url}
                    </a>
                  )}
                </div>
              )}

              {/* Map */}
              {hustle.latitude && hustle.longitude && (
                <div className="mt-6">
                  <h3 className="mb-2 font-semibold text-foreground text-sm">Location</h3>
                  <HustleMap
                    hustles={[hustle]}
                    userLocation={null}
                    className="h-[250px]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="shadow-card">
              <CardContent className="p-6">
                {hustle.price ? (
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-foreground">
                      R{hustle.price}
                      {hustle.price_type === "hourly" && <span className="text-base font-normal text-muted-foreground">/hr</span>}
                    </p>
                    {hustle.price_type === "negotiable" && <p className="text-sm text-muted-foreground">Price is negotiable</p>}
                  </div>
                ) : (
                  <p className="mb-4 text-lg font-medium text-muted-foreground">Contact for pricing</p>
                )}

                {user && user.id !== hustle.user_id && (
                  <div className="space-y-2">
                    <Button onClick={handleStartChat} className="w-full gradient-primary text-primary-foreground gap-2" disabled={startConversation.isPending}>
                      <MessageSquare className="h-4 w-4" /> {startConversation.isPending ? "Starting..." : "Chat with Hustler"}
                    </Button>
                    <Button onClick={() => setBookingOpen(true)} variant="outline" className="w-full gap-2">
                      <CalendarDays className="h-4 w-4" /> Book Now
                    </Button>
                  </div>
                )}

                {!user && (
                  <Link to="/auth">
                    <Button className="w-full gradient-primary text-primary-foreground">Sign in to contact</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profileData?.avatar_url || ""} alt={profileData?.display_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profileData?.display_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{profileData?.display_name || "Unknown"}</p>
                      <VerificationBadge level={profileData?.verification_level ?? 0} showLabel />
                    </div>
                    {profileData?.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {profileData.location}
                      </p>
                    )}
                  </div>
                </div>
                {profileData?.bio && <p className="mt-3 text-sm text-muted-foreground">{profileData.bio}</p>}
                {profileData?.response_time_minutes && (
                  <p className="mt-2 text-xs text-muted-foreground">⚡ Typically responds in {profileData.response_time_minutes} min</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Modal */}
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
