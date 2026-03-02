import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMyHustles } from "@/hooks/useData";
import { useBoostPackages, useRequestBoost, useMyBoosts } from "@/hooks/useBoosts";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Check, Clock, ArrowLeft, Zap, Eye, MousePointer, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BoostHustle = () => {
  const { hustleId } = useParams<{ hustleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: packages, isLoading: pkgLoading } = useBoostPackages();
  const { data: myHustles } = useMyHustles();
  const { data: myBoosts } = useMyBoosts();
  const requestBoost = useRequestBoost();
  const [selectedHustle, setSelectedHustle] = useState(hustleId || "");
  const [selectedPkg, setSelectedPkg] = useState("");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const selectedPackage = packages?.find((p) => p.id === selectedPkg);

  const handleRequest = async () => {
    if (!selectedHustle || !selectedPkg || !selectedPackage) {
      toast.error("Please select a hustle and package");
      return;
    }
    try {
      await requestBoost.mutateAsync({
        hustleId: selectedHustle,
        packageId: selectedPkg,
        amountCents: selectedPackage.price_cents,
      });
      toast.success("Boost requested! We'll activate it once payment is confirmed.");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to request boost");
    }
  };

  const hustleBoosts = myBoosts?.filter((b) => !hustleId || b.hustle_id === hustleId) || [];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Boost Your Hustle" description="Get more visibility by boosting your hustle listing." path="/boost" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-7 w-7 text-primary" /> Boost Your Hustle
          </h1>
          <p className="text-muted-foreground mt-1">Get more visibility — boosted hustles appear first with a special badge everywhere.</p>
        </div>

        {/* Select Hustle */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">1. Select a Hustle</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedHustle} onValueChange={setSelectedHustle}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your hustle..." />
              </SelectTrigger>
              <SelectContent>
                {myHustles?.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Select Package */}
        <Card className="mb-6 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">2. Choose a Boost Package</CardTitle>
          </CardHeader>
          <CardContent>
            {pkgLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {packages?.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg.id)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      selectedPkg === pkg.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{pkg.name}</p>
                        {pkg.description && <p className="text-sm text-muted-foreground">{pkg.description}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">R{(pkg.price_cents / 100).toFixed(0)}</p>
                        <p className="text-xs text-muted-foreground">{pkg.duration_days} day{pkg.duration_days > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {selectedPkg === pkg.id && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                        <Check className="h-4 w-4" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="mb-6 shadow-card border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> How Payment Works
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Submit your boost request below</li>
              <li>Make payment via EFT or mobile money (details will be provided)</li>
              <li>Our admin team confirms payment and activates your boost</li>
              <li>Your hustle appears at the top with a 🚀 Boosted badge!</li>
            </ol>
          </CardContent>
        </Card>

        {/* Submit */}
        <Button
          onClick={handleRequest}
          disabled={!selectedHustle || !selectedPkg || requestBoost.isPending}
          className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold gap-2"
        >
          <Rocket className="h-5 w-5" />
          {requestBoost.isPending ? "Submitting..." : selectedPackage ? `Request Boost — R${(selectedPackage.price_cents / 100).toFixed(0)}` : "Request Boost"}
        </Button>

        {/* My Boosts History */}
        {hustleBoosts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-foreground mb-4">Your Boosts</h2>
            <div className="space-y-3">
              {hustleBoosts.map((boost) => {
                const pkg = boost.boost_packages as any;
                return (
                  <Card key={boost.id} className="shadow-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{pkg?.name || "Boost"}</p>
                          <p className="text-xs text-muted-foreground">
                            Requested {format(new Date(boost.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge
                          variant={boost.status === "active" ? "default" : boost.status === "rejected" ? "destructive" : "secondary"}
                        >
                          {boost.status === "active" ? "🚀 Active" : boost.status === "pending" ? "⏳ Pending" : boost.status === "expired" ? "Expired" : "Rejected"}
                        </Badge>
                      </div>
                      {boost.status === "active" && boost.ends_at && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Expires {format(new Date(boost.ends_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoostHustle;
