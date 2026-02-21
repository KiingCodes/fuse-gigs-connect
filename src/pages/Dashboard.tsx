import { useAuth } from "@/contexts/AuthContext";
import { useMyHustles, useDashboardStats } from "@/hooks/useData";
import Navbar from "@/components/Navbar";
import HustleCard from "@/components/HustleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Briefcase, TrendingUp, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: myHustles, isLoading: hustlesLoading } = useMyHustles();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const statCards = [
    { label: "Total Hustles", value: stats?.totalHustles || 0, icon: Briefcase, color: "text-primary" },
    { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "text-success" },
    { label: "Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "text-warning" },
    { label: "Active", value: stats?.activeHustles || 0, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your hustles and track performance</p>
          </div>
          <Link to="/create">
            <Button className="gradient-primary text-primary-foreground gap-1">
              <Plus className="h-4 w-4" /> New Hustle
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-xl bg-muted p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Hustles */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-foreground">Your Hustles</h2>
          {hustlesLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : myHustles && myHustles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myHustles.map((hustle) => (
                <HustleCard key={hustle.id} hustle={hustle} />
              ))}
            </div>
          ) : (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <Briefcase className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg font-medium text-foreground">No hustles yet</p>
                <p className="mb-4 text-muted-foreground">Create your first hustle to start connecting with customers.</p>
                <Link to="/create">
                  <Button className="gradient-primary text-primary-foreground">Create Your First Hustle</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
