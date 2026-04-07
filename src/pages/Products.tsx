import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, X, Package, ShoppingBag, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

const Products = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const userIds = [...new Set((data || []).map((p: any) => p.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds.length > 0 ? userIds : ["_"]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      return (data || []).map((p: any) => ({ ...p, profile: profileMap.get(p.user_id) }));
    },
  });

  const createProduct = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      let mediaUrl: string | null = null;
      if (mediaFile) {
        const ext = mediaFile.name.split(".").pop();
        const path = `products/${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("hustle-media").upload(path, mediaFile);
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from("hustle-media").getPublicUrl(path);
        mediaUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("products").insert({
        user_id: user.id,
        title,
        description,
        price: parseFloat(price),
        stock_quantity: stock ? parseInt(stock) : null,
        category: category || null,
        media_url: mediaUrl,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDialogOpen(false);
      resetForm();
      toast.success("Product listed!");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product removed");
    },
  });

  const resetForm = () => {
    setTitle(""); setDescription(""); setPrice(""); setStock(""); setCategory("");
    setMediaFile(null); setMediaPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) { toast.error("Title and price are required"); return; }
    setSubmitting(true);
    try { await createProduct.mutateAsync(); } catch (err: any) { toast.error(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Products & Materials" path="/products" />
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-primary" /> Products
            </h1>
            <p className="text-muted-foreground mt-1">Buy materials or bundle with services</p>
          </div>
          {user && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-1">
                  <Plus className="h-4 w-4" /> Sell Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>List a Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Title *</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Price (R) *</Label>
                      <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Stock Qty</Label>
                      <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Unlimited" min="0" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Hair Products, Tools" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Product Image</Label>
                    {mediaPreview ? (
                      <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-border">
                        <img src={mediaPreview} alt="" className="h-full w-full object-cover" />
                        <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setMediaFile(f); setMediaPreview(URL.createObjectURL(f)); }
                    }} />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                    {submitting ? "Listing..." : "List Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="overflow-hidden rounded-2xl group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {product.media_url ? (
                      <img src={product.media_url} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-0 font-bold text-sm shadow-md">
                      R{product.price}
                    </Badge>
                    {product.stock_quantity != null && product.stock_quantity <= 5 && (
                      <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground border-0 text-xs">
                        {product.stock_quantity === 0 ? "Sold Out" : `${product.stock_quantity} left`}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{product.title}</h3>
                    {product.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={product.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
                            {product.profile?.display_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{product.profile?.display_name || "User"}</span>
                      </div>
                      {user && product.user_id === user.id && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteProduct.mutate(product.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                    {product.category && (
                      <Badge variant="outline" className="mt-2 text-[10px]">{product.category}</Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg text-muted-foreground">No products listed yet</p>
            {user && <p className="text-sm text-muted-foreground mt-1">Be the first to sell something!</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
