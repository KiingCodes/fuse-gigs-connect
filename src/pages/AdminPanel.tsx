import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useAllVerificationRequests, useReviewVerification } from "@/hooks/useAdmin";
import { useAllBoosts, useAdminUpdateBoost } from "@/hooks/useBoosts";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Shield, Loader2, Phone, FileText, Camera, Briefcase, Rocket } from "lucide-react";
import { format } from "date-fns";

const STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "secondary", label: "Pending" },
  approved: { variant: "default", label: "Approved" },
  rejected: { variant: "destructive", label: "Rejected" },
};

const LEVEL_LABELS: Record<number, { label: string; icon: typeof Phone }> = {
  1: { label: "Phone Verification", icon: Phone },
  2: { label: "ID + Selfie Verification", icon: FileText },
  3: { label: "Business Verification", icon: Briefcase },
};

const BOOST_STATUS_BADGE: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
  pending: { variant: "secondary", label: "⏳ Pending Payment" },
  active: { variant: "default", label: "🚀 Active" },
  expired: { variant: "outline", label: "Expired" },
  rejected: { variant: "destructive", label: "Rejected" },
};

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [mainTab, setMainTab] = useState("verifications");
  const [tab, setTab] = useState("pending");
  const [boostTab, setBoostTab] = useState("pending");
  const { data: requests, isLoading } = useAllVerificationRequests(tab);
  const { data: boosts, isLoading: boostsLoading } = useAllBoosts(boostTab);
  const reviewMutation = useReviewVerification();
  const updateBoost = useAdminUpdateBoost();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">You don't have permission to view this page.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const handleReview = async (requestId: string, userId: string, level: number, status: "approved" | "rejected") => {
    try {
      await reviewMutation.mutateAsync({
        requestId,
        userId,
        status,
        level,
        adminNotes: notesMap[requestId] || undefined,
      });
      toast.success(`Request ${status}!`);
      setNotesMap((prev) => {
        const copy = { ...prev };
        delete copy[requestId];
        return copy;
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to review request.");
    }
  };

  const handleBoostAction = async (boostId: string, status: "active" | "rejected", durationDays?: number) => {
    try {
      await updateBoost.mutateAsync({ boostId, status, durationDays });
      toast.success(status === "active" ? "Boost activated!" : "Boost rejected.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update boost.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Panel" description="Manage verifications and boosts." path="/admin" />
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

        <Tabs value={mainTab} onValueChange={setMainTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="verifications" className="gap-1">
              <Shield className="h-4 w-4" /> Verifications
            </TabsTrigger>
            <TabsTrigger value="boosts" className="gap-1">
              <Rocket className="h-4 w-4" /> Boosts
            </TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-1"><Clock className="h-4 w-4" /> Pending</TabsTrigger>
                <TabsTrigger value="approved" className="gap-1"><CheckCircle className="h-4 w-4" /> Approved</TabsTrigger>
                <TabsTrigger value="rejected" className="gap-1"><XCircle className="h-4 w-4" /> Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={tab}>
                {isLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : !requests || requests.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No {tab === "all" ? "" : tab} verification requests found.</CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => {
                      const levelCfg = LEVEL_LABELS[req.level] || LEVEL_LABELS[1];
                      const LevelIcon = levelCfg.icon;
                      const badgeCfg = STATUS_BADGE[req.status] || STATUS_BADGE.pending;
                      return (
                        <Card key={req.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={req.profiles?.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">{req.profiles?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{req.profiles?.display_name || "Unknown User"}</CardTitle>
                                  <p className="text-xs text-muted-foreground">{format(new Date(req.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                              </div>
                              <Badge variant={badgeCfg.variant}>{badgeCfg.label}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium"><LevelIcon className="h-4 w-4 text-primary" /> Level {req.level} — {levelCfg.label}</div>
                            <div className="grid gap-2 text-sm rounded-lg border p-3 bg-muted/30">
                              {req.phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Phone:</span><span>{req.phone}</span></div>}
                              {req.id_document_url && <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">ID Document:</span><span className="text-primary">Uploaded ✓</span></div>}
                              {req.selfie_url && <div className="flex items-center gap-2"><Camera className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Selfie:</span><span className="text-primary">Uploaded ✓</span></div>}
                              {req.business_reg_url && <div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Business Reg:</span><span className="text-primary">Uploaded ✓</span></div>}
                              {req.profiles && <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-muted-foreground">Current Level:</span><span>{req.profiles.verification_level}</span></div>}
                            </div>
                            {req.admin_notes && <div className="text-sm rounded-lg border p-3 bg-muted/30"><span className="font-medium">Admin Notes: </span>{req.admin_notes}</div>}
                            {req.status === "pending" && (
                              <div className="space-y-3 pt-2">
                                <Textarea placeholder="Admin notes (optional)..." value={notesMap[req.id] || ""} onChange={(e) => setNotesMap((prev) => ({ ...prev, [req.id]: e.target.value }))} rows={2} />
                                <div className="flex gap-2">
                                  <Button className="flex-1 gap-1" onClick={() => handleReview(req.id, req.user_id, req.level, "approved")} disabled={reviewMutation.isPending}><CheckCircle className="h-4 w-4" /> Approve</Button>
                                  <Button variant="destructive" className="flex-1 gap-1" onClick={() => handleReview(req.id, req.user_id, req.level, "rejected")} disabled={reviewMutation.isPending}><XCircle className="h-4 w-4" /> Reject</Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Boosts Tab */}
          <TabsContent value="boosts">
            <Tabs value={boostTab} onValueChange={setBoostTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-1"><Clock className="h-4 w-4" /> Pending</TabsTrigger>
                <TabsTrigger value="active" className="gap-1"><Rocket className="h-4 w-4" /> Active</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>

              <TabsContent value={boostTab}>
                {boostsLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : !boosts || boosts.length === 0 ? (
                  <Card><CardContent className="py-12 text-center text-muted-foreground">No {boostTab === "all" ? "" : boostTab} boost requests found.</CardContent></Card>
                ) : (
                  <div className="space-y-4">
                    {boosts.map((boost) => {
                      const pkg = boost.boost_packages as any;
                      const profile = boost.profiles as any;
                      const hustle = boost.hustles as any;
                      const badgeCfg = BOOST_STATUS_BADGE[boost.status] || BOOST_STATUS_BADGE.pending;

                      return (
                        <Card key={boost.id}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={profile?.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary text-primary-foreground">{profile?.display_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <CardTitle className="text-base">{profile?.display_name || "Unknown User"}</CardTitle>
                                  <p className="text-xs text-muted-foreground">{format(new Date(boost.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                              </div>
                              <Badge variant={badgeCfg.variant}>{badgeCfg.label}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="rounded-lg border p-3 bg-muted/30 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Hustle:</span>
                                <span className="font-medium text-foreground">{hustle?.title || "Unknown"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Package:</span>
                                <span className="font-medium text-foreground">{pkg?.name || "Unknown"} ({pkg?.duration_days}d)</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-bold text-foreground">R{(boost.amount_cents / 100).toFixed(0)}</span>
                              </div>
                              {boost.starts_at && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Active:</span>
                                  <span>{format(new Date(boost.starts_at), "MMM d")} — {boost.ends_at ? format(new Date(boost.ends_at), "MMM d, yyyy") : "N/A"}</span>
                                </div>
                              )}
                            </div>

                            {boost.status === "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  className="flex-1 gap-1"
                                  onClick={() => handleBoostAction(boost.id, "active", pkg?.duration_days || 1)}
                                  disabled={updateBoost.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" /> Approve & Activate
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 gap-1"
                                  onClick={() => handleBoostAction(boost.id, "rejected")}
                                  disabled={updateBoost.isPending}
                                >
                                  <XCircle className="h-4 w-4" /> Reject
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
