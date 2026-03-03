import { useAuth } from "@/contexts/AuthContext";
import { useMyHustles, useDashboardStats, useDeleteHustle } from "@/hooks/useData";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HustleCard from "@/components/HustleCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare, Briefcase, TrendingUp, Plus, Pencil, Trash2, Rocket } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: myHustles, isLoading: hustlesLoading } = useMyHustles();
  const deleteHustle = useDeleteHustle();

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleDelete = async (hustleId: string) => {
    try {
      await deleteHustle.mutateAsync(hustleId);
      toast.success("Hustle deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete hustle");
    }
  };

  const statCards = [
    { label: "Total Hustles", value: stats?.totalHustles || 0, icon: Briefcase, color: "text-primary" },
    { label: "Total Views", value: stats?.totalViews || 0, icon: Eye, color: "text-success" },
    { label: "Inquiries", value: stats?.totalInquiries || 0, icon: MessageSquare, color: "text-warning" },
    { label: "Active", value: stats?.activeHustles || 0, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Dashboard" description="Manage your hustles and track performance on Fuse Gigs." path="/dashboard" />
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

        {/* Boost Promotion Banner */}
        <Card className="mb-8 overflow-hidden border-0 gradient-primary shadow-elevated">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-primary-foreground/20 p-3">
                <Rocket className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-foreground">🚀 Boost Your Hustle</h3>
                <p className="text-sm text-primary-foreground/80">Get more views and appear at the top of search results. Starting from R19.</p>
              </div>
            </div>
            <Link to="/boost">
              <Button variant="secondary" className="font-semibold gap-1 whitespace-nowrap">
                <TrendingUp className="h-4 w-4" /> Boost Now
              </Button>
            </Link>
          </CardContent>
        </Card>

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
                <div key={hustle.id} className="relative group">
                  <HustleCard hustle={hustle} />
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 backdrop-blur-sm shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/boost/${hustle.id}`);
                      }}
                      title="Boost this hustle"
                    >
                      <Rocket className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/90 backdrop-blur-sm shadow-md"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/edit/${hustle.id}`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8 shadow-md"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this hustle?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{hustle.title}" and all its media. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(hustle.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
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
