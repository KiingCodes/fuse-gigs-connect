import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories, useUpdateHustle, useUploadHustleMedia, useDeleteHustleMedia } from "@/hooks/useData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Upload, X, Locate, Loader2 } from "lucide-react";
import type { HustleWithDetails } from "@/hooks/useData";

const EditHustle = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const updateHustle = useUpdateHustle();
  const uploadMedia = useUploadHustleMedia();
  const deleteMedia = useDeleteHustleMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [location, setLocation] = useState("");
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [existingMedia, setExistingMedia] = useState<any[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const { location: geoLocation, loading: geoLoading, requestLocation, setLocation: setGeoLocation } = useGeolocation();

  const { data: hustle, isLoading } = useQuery({
    queryKey: ["hustle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hustles")
        .select("*, hustle_categories(name, icon), hustle_media(id, media_url, media_type, display_order)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as HustleWithDetails;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (hustle && !initialized) {
      setTitle(hustle.title);
      setDescription(hustle.description);
      setCategoryId(hustle.category_id || "");
      setPrice(hustle.price?.toString() || "");
      setPriceType(hustle.price_type || "fixed");
      setLocation(hustle.location || "");
      setIsAvailableNow(hustle.is_available_now || false);
      if (hustle.latitude && hustle.longitude) {
        setGeoLocation({ lat: hustle.latitude, lng: hustle.longitude });
      }
      setExistingMedia(hustle.hustle_media?.sort((a, b) => a.display_order - b.display_order) || []);
      setInitialized(true);
    }
  }, [hustle, initialized]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (hustle && hustle.user_id !== user.id) {
    navigate("/dashboard");
    return null;
  }

  const totalMedia = existingMedia.length + newFiles.length;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (totalMedia + selected.length > 10) {
      toast.error("Maximum 10 media files allowed");
      return;
    }
    setNewFiles([...newFiles, ...selected]);
    setNewPreviews([...newPreviews, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingMedia = async (mediaId: string) => {
    try {
      await deleteMedia.mutateAsync(mediaId);
      setExistingMedia(existingMedia.filter(m => m.id !== mediaId));
      toast.success("Media removed");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles(newFiles.filter((_, i) => i !== idx));
    setNewPreviews(newPreviews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await updateHustle.mutateAsync({
        id: id!,
        title,
        description,
        category_id: categoryId,
        price: price ? parseFloat(price) : null,
        price_type: priceType,
        location,
        latitude: geoLocation?.lat ?? null,
        longitude: geoLocation?.lng ?? null,
        is_available_now: isAvailableNow,
      });

      if (newFiles.length > 0) {
        await uploadMedia.mutateAsync({ hustleId: id!, files: newFiles });
      }

      toast.success("Hustle updated successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to update hustle");
    }
    setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Edit Hustle" description="Edit your hustle listing on Fuse Gigs" path={`/edit/${id}`} />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Hustle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
              </div>

              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R)</Label>
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" />
                </div>
                <div className="space-y-2">
                  <Label>Price Type</Label>
                  <Select value={priceType} onValueChange={setPriceType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="hourly">Per Hour</SelectItem>
                      <SelectItem value="negotiable">Negotiable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>

              {/* GPS Location */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">GPS Location</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => { requestLocation(); toast.info("Getting location..."); }} disabled={geoLoading} className="gap-2">
                    {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                    Use My Location
                  </Button>
                </div>
                {geoLocation && (
                  <p className="text-xs text-muted-foreground">📍 {geoLocation.lat.toFixed(4)}, {geoLocation.lng.toFixed(4)}</p>
                )}
              </div>

              {/* Available Now */}
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Switch id="available" checked={isAvailableNow} onCheckedChange={setIsAvailableNow} />
                <div>
                  <Label htmlFor="available" className="text-sm font-medium cursor-pointer">Available Now</Label>
                  <p className="text-xs text-muted-foreground">Mark yourself as currently available</p>
                </div>
              </div>

              {/* Media */}
              <div className="space-y-2">
                <Label>Media ({totalMedia}/10)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {existingMedia.map((media) => (
                    <div key={media.id} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                      {media.media_type === "video" ? (
                        <video src={media.media_url} className="h-full w-full object-cover" />
                      ) : (
                        <img src={media.media_url} alt="Hustle media" className="h-full w-full object-cover" loading="lazy" />
                      )}
                      <button type="button" onClick={() => removeExistingMedia(media.id)} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((preview, idx) => (
                    <div key={`new-${idx}`} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeNewFile(idx)} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {totalMedia < 10 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </div>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden" />
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                {submitting ? "Updating..." : "Update Hustle"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditHustle;
