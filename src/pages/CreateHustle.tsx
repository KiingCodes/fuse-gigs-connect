import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useCreateHustle, useUploadHustleMedia } from "@/hooks/useData";
import { useGeolocation } from "@/hooks/useGeolocation";
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

const CreateHustle = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createHustle = useCreateHustle();
  const uploadMedia = useUploadHustleMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { location: geoLocation, loading: geoLoading, requestLocation } = useGeolocation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [priceType, setPriceType] = useState("fixed");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isAvailableNow, setIsAvailableNow] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 10) {
      toast.error("Maximum 10 media files allowed");
      return;
    }
    setFiles([...files, ...selected]);
    setPreviews([...previews, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(files.filter((_, i) => i !== idx));
    setPreviews(previews.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      // Upload logo if provided
      let logoUrl: string | undefined;
      if (logoFile && user) {
        const ext = logoFile.name.split(".").pop();
        const logoPath = `${user.id}/logo_${Date.now()}.${ext}`;
        const { error: logoUpErr } = await supabase.storage.from("hustle-media").upload(logoPath, logoFile);
        if (logoUpErr) throw logoUpErr;
        const { data: logoData } = supabase.storage.from("hustle-media").getPublicUrl(logoPath);
        logoUrl = logoData.publicUrl;
      }

      const hustle = await createHustle.mutateAsync({
        title, description, category_id: categoryId,
        price: price ? parseFloat(price) : null,
        price_type: priceType, location,
        latitude: geoLocation?.lat ?? null,
        longitude: geoLocation?.lng ?? null,
        is_available_now: isAvailableNow,
        contact_phone: contactPhone || undefined,
        contact_email: contactEmail || undefined,
        website_url: websiteUrl || undefined,
      });

      // Update logo_url on the hustle
      if (logoUrl) {
        await supabase.from("hustles").update({ logo_url: logoUrl } as any).eq("id", hustle.id);
      }

      if (files.length > 0) {
        await uploadMedia.mutateAsync({ hustleId: hustle.id, files });
      }
      toast.success("Hustle created successfully!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create hustle");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Post a New Hustle" description="Create a new hustle listing on Fuse Gigs." path="/create" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl">Post a New Hustle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Professional Hair Braiding" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your hustle..." rows={4} required />
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
                  <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
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

              {/* Business Logo */}
              <div className="space-y-2 rounded-lg border border-border p-4">
                <Label className="text-sm font-medium">Business Logo (optional)</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
                      <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => { if (logoPreview) URL.revokeObjectURL(logoPreview); setLogoFile(null); setLogoPreview(null); }} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Logo</span>
                      </div>
                    </button>
                  )}
                  <p className="text-xs text-muted-foreground">Upload your business logo to stand out</p>
                </div>
                <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} className="hidden" />
              </div>

              {/* Contact Information */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Label className="text-sm font-medium">Contact Information</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" />
                  <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email address" type="email" />
                </div>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL (optional)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Johannesburg, Soweto" />
              </div>

              {/* GPS Location */}
              <div className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">GPS Location</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => { requestLocation(); toast.info("Getting your GPS location..."); }} disabled={geoLoading} className="gap-2">
                    {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Locate className="h-4 w-4" />}
                    Use My Location
                  </Button>
                </div>
                {geoLocation && (
                  <p className="text-xs text-muted-foreground">📍 {geoLocation.lat.toFixed(4)}, {geoLocation.lng.toFixed(4)}</p>
                )}
                <p className="text-xs text-muted-foreground">Adding GPS helps customers find you on the map.</p>
              </div>

              {/* Available Now */}
              <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                <Switch id="available" checked={isAvailableNow} onCheckedChange={setIsAvailableNow} />
                <div>
                  <Label htmlFor="available" className="text-sm font-medium cursor-pointer">Available Now</Label>
                  <p className="text-xs text-muted-foreground">Mark yourself as currently available</p>
                </div>
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label>Media (up to 10 photos/videos)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-border">
                      {files[idx]?.type.startsWith("video") ? (
                        <video src={preview} className="h-full w-full object-cover" />
                      ) : (
                        <img src={preview} alt="" className="h-full w-full object-cover" />
                      )}
                      <button type="button" onClick={() => removeFile(idx)} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {files.length < 10 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-accent transition-colors">
                      <div className="text-center">
                        <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </div>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={handleFiles} className="hidden" />
                <p className="text-xs text-muted-foreground">{files.length}/10 files selected</p>
              </div>

              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                {submitting ? "Creating..." : "Post Hustle"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateHustle;
