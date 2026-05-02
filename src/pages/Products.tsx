import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Upload, X, Package, ShoppingBag, Trash2, Phone, Mail, Eye, Share2, Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { buildShareUrl, shareLink } from "@/lib/share";
import { trackProductView } from "@/hooks/useViews";
import { useTypewriter } from "@/hooks/useTypewriter";
import ProductInquiryDialog from "@/components/ProductInquiryDialog";
import { MessageSquare } from "lucide-react";

const Products = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiryProduct, setInquiryProduct] = useState<any | null>(null);
  const productTypewriter = useTypewriter([
    "Search products, materials, tools...",
    "Find hair extensions",
    "Looking for paint supplies?",
    "Browse handmade crafts",
  ]);
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
      // Get view counts in batch
      const productIds = (data || []).map((p: any) => p.id);
      let viewMap = new Map<string, number>();
      if (productIds.length > 0) {
        const { data: views } = await supabase.from("product_views").select("product_id").in("product_id", productIds);
        (views || []).forEach((v: any) => viewMap.set(v.product_id, (viewMap.get(v.product_id) || 0) + 1));
      }
      return (data || []).map((p: any) => ({
        ...p,
        profile: profileMap.get(p.user_id),
        view_count: viewMap.get(p.id) || 0,
      }));
    },
  });

  // Track view when modal opens
  useEffect(() => {
    if (detailProduct && user && detailProduct.user_id !== user.id) {
      trackProductView(detailProduct.id, user.id, detailProduct.user_id);
    }
  }, [detailProduct, user]);

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

  const handleShare = async (product: any) => {
    const url = buildShareUrl(`/u/${product.user_id}`);
    await shareLink({
      url,
      title: product.title,
      text: `Check out "${product.title}" on Fuse Gigs!`,
      toastSuccess: toast.success,
      toastError: toast.error,
    });
  };

  const filtered = (products || []).filter((p: any) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return p.title?.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t) || p.category?.toLowerCase().includes(t);
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Marketplace — Fuse Gigs" description="Buy materials and bundled products from local hustlers." path="/products" />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-primary to-amber-500 px-4 py-12">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="container relative mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge className="mb-3 bg-white/20 text-white border-0 backdrop-blur-sm gap-1">
                <Sparkles className="h-3 w-3" /> Marketplace
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <ShoppingBag className="h-8 w-8" /> Shop Local
              </h1>
              <p className="mt-2 text-white/85 text-sm sm:text-base max-w-md">
                Buy materials, tools and bundled products straight from verified hustlers.
              </p>
            </div>
            {user && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-foreground hover:bg-white/90 gap-2 shadow-lg font-semibold">
                    <Plus className="h-4 w-4" /> Sell a Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>List a Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product name" required /></div>
                    <div className="space-y-1.5"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product" rows={3} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label>Price (R) *</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required /></div>
                      <div className="space-y-1.5"><Label>Stock Qty</Label><Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Unlimited" min="0" /></div>
                    </div>
                    <div className="space-y-1.5"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Hair Products, Tools" /></div>
                    <div className="space-y-1.5">
                      <Label>Product Image</Label>
                      {mediaPreview ? (
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-border">
                          <img src={mediaPreview} alt="" className="h-full w-full object-cover" />
                          <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); }} className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground"><X className="h-3 w-3" /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors"><Upload className="h-6 w-6 text-muted-foreground" /></button>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setMediaFile(f); setMediaPreview(URL.createObjectURL(f)); } }} />
                    </div>
                    <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? "Listing..." : "List Product"}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={productTypewriter}
              className="h-11 pl-10 bg-white/95 backdrop-blur border-0 shadow-md text-foreground"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product: any) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card
                  className="group overflow-hidden rounded-2xl border border-border/40 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.18)] transition-all cursor-pointer"
                  onClick={() => setDetailProduct(product)}
                >
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {product.media_url ? (
                      <img src={product.media_url} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-muted"><Package className="h-16 w-16 text-muted-foreground/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Top badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                      {product.category && <Badge className="bg-white/90 text-foreground border-0 text-[10px] font-semibold backdrop-blur-sm">{product.category}</Badge>}
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                      {product.stock_quantity != null && product.stock_quantity <= 5 && (
                        <Badge className={`border-0 text-[10px] ${product.stock_quantity === 0 ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"}`}>
                          {product.stock_quantity === 0 ? "Sold Out" : `${product.stock_quantity} left`}
                        </Badge>
                      )}
                      {product.view_count > 0 && (
                        <Badge className="bg-black/60 text-white border-0 text-[10px] gap-1 backdrop-blur-sm"><Eye className="h-2.5 w-2.5" /> {product.view_count}</Badge>
                      )}
                    </div>

                    {/* Price chip */}
                    <div className="absolute bottom-2 left-2 rounded-xl bg-white text-foreground px-3 py-1 text-sm font-extrabold shadow-lg">
                      R{product.price}
                    </div>

                    {/* Quick share */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(product); }}
                      className="absolute bottom-2 right-2 rounded-full bg-white/95 p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Share product"
                    >
                      <Share2 className="h-3.5 w-3.5 text-foreground" />
                    </button>
                  </div>
                  <CardContent className="p-3.5">
                    <h3 className="font-bold text-foreground text-sm line-clamp-1 mb-1">{product.title}</h3>
                    {product.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">{product.description}</p>}
                    <div className="flex items-center justify-between">
                      <Link to={`/u/${product.user_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 group/seller">
                        <Avatar className="h-6 w-6 ring-1 ring-border">
                          <AvatarImage src={product.profile?.avatar_url || ""} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">{product.profile?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground group-hover/seller:text-primary transition-colors truncate max-w-[100px]">{product.profile?.display_name || "User"}</span>
                      </Link>
                      {user && product.user_id === user.id && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteProduct.mutate(product.id); }}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-lg text-muted-foreground">{searchTerm ? "No matching products" : "No products listed yet"}</p>
            {user && !searchTerm && <p className="text-sm text-muted-foreground mt-1">Be the first to sell something!</p>}
          </div>
        )}
      </div>

      {/* Product Detail Modal with seller contact */}
      <Dialog open={!!detailProduct} onOpenChange={(o) => !o && setDetailProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {detailProduct && (
            <div className="grid sm:grid-cols-2">
              <div className="relative aspect-square sm:aspect-auto bg-muted">
                {detailProduct.media_url ? (
                  <img src={detailProduct.media_url} alt={detailProduct.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Package className="h-20 w-20 text-muted-foreground/30" /></div>
                )}
                <div className="absolute top-3 left-3 rounded-xl bg-white text-foreground px-3 py-1.5 font-extrabold shadow-lg">R{detailProduct.price}</div>
                {detailProduct.view_count > 0 && (
                  <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0 gap-1 backdrop-blur-sm">
                    <Eye className="h-3 w-3" /> {detailProduct.view_count} views
                  </Badge>
                )}
              </div>
              <div className="flex flex-col p-5">
                <DialogHeader>
                  <DialogTitle className="text-xl text-left">{detailProduct.title}</DialogTitle>
                </DialogHeader>
                {detailProduct.category && <Badge variant="outline" className="mt-1 w-fit text-[10px]">{detailProduct.category}</Badge>}
                {detailProduct.description && <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{detailProduct.description}</p>}

                {detailProduct.stock_quantity != null && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Stock: <span className="font-semibold text-foreground">{detailProduct.stock_quantity === 0 ? "Sold out" : detailProduct.stock_quantity}</span>
                  </p>
                )}

                {/* Seller contact */}
                <div className="mt-5 rounded-2xl border border-border bg-muted/30 p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Seller</p>
                  <Link to={`/u/${detailProduct.user_id}`} className="flex items-center gap-3 group">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                      <AvatarImage src={detailProduct.profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{detailProduct.profile?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{detailProduct.profile?.display_name || "Seller"}</p>
                      {detailProduct.profile?.location && <p className="text-xs text-muted-foreground">{detailProduct.profile.location}</p>}
                    </div>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {detailProduct.profile?.phone && (
                      <a href={`tel:${detailProduct.profile.phone}`} className="flex-1 min-w-[140px]">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          <Phone className="h-3.5 w-3.5" /> {detailProduct.profile.phone}
                        </Button>
                      </a>
                    )}
                    <Link to={`/u/${detailProduct.user_id}`} className="flex-1 min-w-[120px]">
                      <Button size="sm" className="w-full gap-1.5 text-xs gradient-primary text-primary-foreground">
                        <Mail className="h-3.5 w-3.5" /> View Profile
                      </Button>
                    </Link>
                  </div>
                </div>

                <DialogFooter className="mt-5 flex-row gap-2 sm:justify-end">
                  {user && detailProduct.user_id !== user.id && (
                    <Button size="sm" className="gap-1 gradient-primary text-primary-foreground" onClick={() => setInquiryProduct(detailProduct)}>
                      <MessageSquare className="h-4 w-4" /> Inquire
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => handleShare(detailProduct)}>
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </DialogFooter>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {inquiryProduct && (
        <ProductInquiryDialog
          open={!!inquiryProduct}
          onOpenChange={(o) => !o && setInquiryProduct(null)}
          product={inquiryProduct}
        />
      )}
    </div>
  );
};

export default Products;
