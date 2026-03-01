import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import VerificationBadge from "@/components/VerificationBadge";
import { Upload, Phone, FileText, Camera, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending Review", color: "text-amber-500" },
  approved: { icon: CheckCircle, label: "Approved", color: "text-emerald-500" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-destructive" },
};

const VerificationForm = ({ currentLevel }: { currentLevel: number }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const idFileRef = useRef<HTMLInputElement>(null);
  const selfieFileRef = useRef<HTMLInputElement>(null);
  const businessFileRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [businessFile, setBusinessFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["verification-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const pendingRequest = requests?.find((r) => r.status === "pending");
  const nextLevel = currentLevel + 1;

  const uploadFile = async (file: File, folder: string) => {
    if (!user) throw new Error("Not authenticated");
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${folder}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("verification-docs").upload(path, file);
    if (error) throw error;
    // Build a path reference (not public URL since bucket is private)
    return path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate based on level
    if (nextLevel === 1 && !phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (nextLevel === 2 && (!idFile || !selfieFile)) {
      toast.error("Please upload both your ID document and a selfie.");
      return;
    }
    if (nextLevel === 3 && !businessFile) {
      toast.error("Please upload your business registration document.");
      return;
    }

    setSubmitting(true);
    try {
      let id_document_url: string | null = null;
      let selfie_url: string | null = null;
      let business_reg_url: string | null = null;

      if (idFile) id_document_url = await uploadFile(idFile, "id_doc");
      if (selfieFile) selfie_url = await uploadFile(selfieFile, "selfie");
      if (businessFile) business_reg_url = await uploadFile(businessFile, "business_reg");

      const { error } = await supabase.from("verification_requests").insert({
        user_id: user.id,
        level: nextLevel,
        phone: phone.trim() || null,
        id_document_url,
        selfie_url,
        business_reg_url,
      });
      if (error) throw error;

      toast.success("Verification request submitted! We'll review it shortly.");
      queryClient.invalidateQueries({ queryKey: ["verification-requests"] });
      setPhone("");
      setIdFile(null);
      setSelfieFile(null);
      setBusinessFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (currentLevel >= 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Verification
            <VerificationBadge level={currentLevel} size="md" showLabel />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">You've reached the highest verification level. 🎉</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Verification
          <VerificationBadge level={currentLevel} size="md" showLabel />
        </CardTitle>
        <CardDescription>
          Increase your trust level to attract more clients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show past requests */}
        {requests && requests.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Previous Requests</Label>
            {requests.map((req) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const Icon = cfg.icon;
              return (
                <div key={req.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>Level {req.level} verification</span>
                  <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                    <Icon className="h-3 w-3" />
                    {cfg.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}

        {pendingRequest ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Verification in progress
            </div>
            <p className="mt-1 text-muted-foreground">
              Your Level {pendingRequest.level} request is being reviewed. We'll notify you once it's processed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-lg border p-4 space-y-4">
              <h4 className="font-semibold text-sm">
                Level {nextLevel} — {nextLevel === 1 ? "Phone Verification" : nextLevel === 2 ? "ID Verification" : "Business Verification"}
              </h4>

              {nextLevel >= 1 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone Number</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 123 4567"
                    required={nextLevel === 1}
                  />
                </div>
              )}

              {nextLevel >= 2 && (
                <>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> ID Document</Label>
                    <div
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                      onClick={() => idFileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {idFile ? idFile.name : "Upload ID document (PDF, JPG, PNG)"}
                    </div>
                    <input
                      ref={idFileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Camera className="h-4 w-4" /> Selfie</Label>
                    <div
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                      onClick={() => selfieFileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {selfieFile ? selfieFile.name : "Upload a clear selfie (JPG, PNG)"}
                    </div>
                    <input
                      ref={selfieFileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </div>
                </>
              )}

              {nextLevel >= 3 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><FileText className="h-4 w-4" /> Business Registration</Label>
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
                    onClick={() => businessFileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {businessFile ? businessFile.name : "Upload business registration (PDF, JPG, PNG)"}
                  </div>
                  <input
                    ref={businessFileRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setBusinessFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Verification Request"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default VerificationForm;
