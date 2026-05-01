import { useMyGuarantorRequests, useRespondToGuarantor } from "@/hooks/useGuarantors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Check, X } from "lucide-react";
import { toast } from "sonner";

const GuarantorRequestsPanel = () => {
  const { data: requests, isLoading } = useMyGuarantorRequests();
  const respond = useRespondToGuarantor();

  if (isLoading) return null;
  if (!requests || requests.length === 0) {
    return (
      <Card className="mt-6 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Guarantor Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No pending requests. When someone asks you to vouch for them, it will show here.</p>
        </CardContent>
      </Card>
    );
  }

  const handle = async (id: string, status: "approved" | "rejected") => {
    try {
      await respond.mutateAsync({ id, status });
      toast.success(status === "approved" ? "Endorsement sent!" : "Request declined.");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <Card className="mt-6 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          Guarantor Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((req: any) => (
          <div key={req.id} className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={req.hustler_profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {req.hustler_profile?.display_name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{req.hustler_profile?.display_name || "User"}</p>
                <p className="text-xs text-muted-foreground">wants you to vouch for them</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="h-8 gap-1" onClick={() => handle(req.id, "approved")} disabled={respond.isPending}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handle(req.id, "rejected")} disabled={respond.isPending}>
                <X className="h-3.5 w-3.5" /> Decline
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default GuarantorRequestsPanel;
