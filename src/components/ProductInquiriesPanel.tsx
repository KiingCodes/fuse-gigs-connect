import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Phone, Mail, CheckCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const ProductInquiriesPanel = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["my-product-inquiries"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("product_inquiries")
        .select("*")
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const buyerIds = [...new Set((data || []).map((i: any) => i.buyer_id))];
      const productIds = [...new Set((data || []).map((i: any) => i.product_id))];
      const [{ data: profiles }, { data: products }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", buyerIds.length ? buyerIds : ["_"]),
        supabase.from("products").select("id, title, media_url").in("id", productIds.length ? productIds : ["_"]),
      ]);
      const pm = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const prm = new Map((products || []).map((p: any) => [p.id, p]));
      return (data || []).map((i: any) => ({ ...i, buyer: pm.get(i.buyer_id), product: prm.get(i.product_id) }));
    },
    enabled: !!user,
  });

  const markResolved = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("product_inquiries").update({ status: "resolved" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-product-inquiries"] }); toast.success("Marked resolved"); },
  });

  if (isLoading) {
    return (
      <Card className="mt-6"><CardContent className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent></Card>
    );
  }

  if (!inquiries || inquiries.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" /> Product Inquiries
          <Badge variant="secondary">{inquiries.filter((i: any) => i.status === "pending").length} new</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inquiries.map((inq: any) => (
          <div key={inq.id} className="rounded-xl border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              {inq.product?.media_url && <img src={inq.product.media_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{inq.product?.title || "Product"}</p>
                <p className="text-[11px] text-muted-foreground">{format(new Date(inq.created_at), "MMM d, h:mm a")}</p>
              </div>
              <Badge variant={inq.status === "pending" ? "secondary" : "default"}>{inq.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7"><AvatarImage src={inq.buyer?.avatar_url || ""} /><AvatarFallback className="text-[10px]">{inq.buyer?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback></Avatar>
              <span className="text-xs font-medium">{inq.buyer?.display_name || "Buyer"}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{inq.message}</p>
            <div className="flex flex-wrap items-center gap-2">
              {inq.contact_phone && <a href={`tel:${inq.contact_phone}`}><Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><Phone className="h-3 w-3" />{inq.contact_phone}</Button></a>}
              {inq.contact_email && <a href={`mailto:${inq.contact_email}`}><Button variant="outline" size="sm" className="h-7 gap-1 text-xs"><Mail className="h-3 w-3" />{inq.contact_email}</Button></a>}
              {inq.status === "pending" && (
                <Button size="sm" className="h-7 gap-1 text-xs ml-auto" onClick={() => markResolved.mutate(inq.id)}>
                  <CheckCircle className="h-3 w-3" /> Resolve
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProductInquiriesPanel;
