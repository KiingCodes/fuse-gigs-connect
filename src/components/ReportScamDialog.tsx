import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ReportScamDialogProps {
  reportedUserId?: string;
  reportedHustleId?: string;
  trigger?: React.ReactNode;
}

const REPORT_REASONS = [
  "Fake listing",
  "Scam / fraud",
  "Impersonation",
  "Inappropriate content",
  "Suspicious pricing",
  "Spam",
  "Other",
];

const ReportScamDialog = ({ reportedUserId, reportedHustleId, trigger }: ReportScamDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("scam_reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        reported_hustle_id: reportedHustleId || null,
        reason,
        description: description || null,
        report_type: reportedHustleId ? "hustle" : "user",
      });
      if (error) throw error;
      toast.success("Report submitted. We'll review it shortly.");
      setOpen(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit report");
    }
    setSubmitting(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" /> Report Scam or Abuse
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide details about the issue..." rows={3} />
          </div>
          <Button type="submit" className="w-full" variant="destructive" disabled={submitting || !reason}>
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportScamDialog;
