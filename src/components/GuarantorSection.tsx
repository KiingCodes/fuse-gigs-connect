import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGuarantors, useRequestGuarantor, useRespondToGuarantor, useRemoveGuarantor, useMyGuarantorRequests } from "@/hooks/useGuarantors";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  hustlerId: string;
  isOwner: boolean;
}

const GuarantorSection = ({ hustlerId, isOwner }: Props) => {
  const { user } = useAuth();
  const { data: guarantors, isLoading } = useGuarantors(hustlerId);
  const requestGuarantor = useRequestGuarantor();
  const respondToGuarantor = useRespondToGuarantor();
  const removeGuarantor = useRemoveGuarantor();
  const [searchEmail, setSearchEmail] = useState("");
  const [searching, setSearching] = useState(false);

  const approvedGuarantors = guarantors?.filter((g) => g.status === "approved") || [];
  const pendingGuarantors = guarantors?.filter((g) => g.status === "pending") || [];
  const myPendingAsGuarantor = guarantors?.filter((g) => g.status === "pending" && g.guarantor_id === user?.id) || [];

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, verification_level")
        .ilike("display_name", `%${searchEmail.trim()}%`)
        .neq("user_id", user?.id || "")
        .limit(5);

      if (!profiles || profiles.length === 0) {
        toast.error("No users found with that name");
        return;
      }

      // Check verification
      const verified = profiles.filter((p) => p.verification_level >= 1);
      if (verified.length === 0) {
        toast.error("Only verified users can be guarantors");
        return;
      }

      // Check if already at max
      if ((approvedGuarantors.length + pendingGuarantors.length) >= 3) {
        toast.error("Maximum 3 guarantors allowed");
        return;
      }

      // Request the first verified match
      const target = verified[0];
      const alreadyRequested = guarantors?.some((g) => g.guarantor_id === target.user_id);
      if (alreadyRequested) {
        toast.info("Already requested this user as a guarantor");
        return;
      }

      await requestGuarantor.mutateAsync(target.user_id);
      toast.success(`Guarantor request sent to ${target.display_name || "user"}!`);
      setSearchEmail("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSearching(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Community Guarantors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Approved guarantors */}
        {approvedGuarantors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Backed by</p>
            {approvedGuarantors.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={g.guarantor_profile?.avatar_url || ""} />
                    <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                      {g.guarantor_profile?.display_name?.[0]?.toUpperCase() || "G"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">{g.guarantor_profile?.display_name || "User"}</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">Verified</Badge>
                </div>
                {(g.guarantor_id === user?.id || isOwner) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeGuarantor.mutate(g.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pending for the guarantor to respond */}
        {myPendingAsGuarantor.length > 0 && (
          <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">You've been asked to vouch</p>
            {myPendingAsGuarantor.map((g) => (
              <div key={g.id} className="flex items-center gap-2">
                <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => respondToGuarantor.mutate({ id: g.id, status: "approved" })}>
                  <Check className="h-3 w-3" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => respondToGuarantor.mutate({ id: g.id, status: "rejected" })}>
                  <X className="h-3 w-3" /> Decline
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Pending requests (visible to owner) */}
        {isOwner && pendingGuarantors.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pending requests</p>
            {pendingGuarantors.map((g) => (
              <div key={g.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{g.guarantor_profile?.display_name || "User"}</span>
                <Badge variant="outline" className="text-[10px]">Pending</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Add guarantor (owner only, max 3) */}
        {isOwner && (approvedGuarantors.length + pendingGuarantors.length) < 3 && (
          <div className="flex gap-2">
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Search user name..."
              className="h-9 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="sm" className="h-9 gap-1 shrink-0" onClick={handleSearch} disabled={searching || requestGuarantor.isPending}>
              <UserPlus className="h-4 w-4" /> Add
            </Button>
          </div>
        )}

        {approvedGuarantors.length === 0 && !isOwner && (
          <p className="text-xs text-muted-foreground">No community guarantors yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default GuarantorSection;
