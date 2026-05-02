import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyProductInquiry } from "@/hooks/useNotifications";
import { Send } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: {
    id: string;
    title: string;
    user_id: string;
    profile?: { display_name?: string | null } | null;
  };
}

const ProductInquiryDialog = ({ open, onOpenChange, product }: Props) => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return toast.error("Sign in to send an inquiry");
    if (!message.trim()) return toast.error("Add a message");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("product_inquiries").insert({
        product_id: product.id,
        buyer_id: user.id,
        seller_id: product.user_id,
        message: message.trim(),
        contact_phone: phone || null,
        contact_email: email || null,
      });
      if (error) throw error;
      await notifyProductInquiry(
        product.user_id,
        profile?.display_name || user.email || "A buyer",
        product.title,
        product.id
      );
      toast.success("Inquiry sent! The seller will get back to you soon.");
      setMessage("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Inquire about "{product.title}"</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Message *</Label>
            <Textarea
              placeholder="Hi, is this still available? I'd like to know more..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Your phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label>Your email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" type="email" />
            </div>
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full gradient-primary text-primary-foreground gap-2">
            <Send className="h-4 w-4" /> {submitting ? "Sending..." : "Send inquiry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductInquiryDialog;
