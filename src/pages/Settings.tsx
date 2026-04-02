import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Moon, Sun, Monitor, Bell, BellOff, MessageSquare, CalendarDays, Rocket, Star, Shield, Heart, GraduationCap, Trophy, Eye, CreditCard, Users, AlertTriangle, Sparkles } from "lucide-react";
import { requestNotificationPermission } from "@/hooks/usePushNotifications";

type ThemeMode = "light" | "dark" | "system";

interface NotificationPrefs {
  messages: boolean;
  bookings: boolean;
  booking_reminders: boolean;
  reviews: boolean;
  boosts: boolean;
  verification: boolean;
  hustle_saved: boolean;
  inquiries: boolean;
  academy: boolean;
  milestones: boolean;
  profile_views: boolean;
  payments: boolean;
  new_hustles: boolean;
  followers: boolean;
  hustle_expiring: boolean;
  welcome: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  messages: true,
  bookings: true,
  booking_reminders: true,
  reviews: true,
  boosts: true,
  verification: true,
  hustle_saved: true,
  inquiries: true,
  academy: true,
  milestones: true,
  profile_views: true,
  payments: true,
  new_hustles: true,
  followers: true,
  hustle_expiring: true,
  welcome: true,
};

const NOTIF_CATEGORIES: { key: keyof NotificationPrefs; label: string; description: string; icon: React.ReactNode }[] = [
  { key: "messages", label: "Messages", description: "New chat messages", icon: <MessageSquare className="h-4 w-4" /> },
  { key: "bookings", label: "Bookings", description: "Booking requests & confirmations", icon: <CalendarDays className="h-4 w-4" /> },
  { key: "booking_reminders", label: "Booking Reminders", description: "Upcoming booking alerts", icon: <AlertTriangle className="h-4 w-4" /> },
  { key: "reviews", label: "Reviews", description: "New reviews on your hustles", icon: <Star className="h-4 w-4" /> },
  { key: "boosts", label: "Boosts", description: "Boost activation & expiry alerts", icon: <Rocket className="h-4 w-4" /> },
  { key: "verification", label: "Verification", description: "Verification status updates", icon: <Shield className="h-4 w-4" /> },
  { key: "hustle_saved", label: "Hustle Saved", description: "When someone saves your hustle", icon: <Heart className="h-4 w-4" /> },
  { key: "inquiries", label: "Inquiries", description: "New inquiries on your hustles", icon: <Sparkles className="h-4 w-4" /> },
  { key: "academy", label: "Academy", description: "New lessons & content", icon: <GraduationCap className="h-4 w-4" /> },
  { key: "milestones", label: "Milestones", description: "Achievement notifications", icon: <Trophy className="h-4 w-4" /> },
  { key: "profile_views", label: "Profile Views", description: "When someone views your profile", icon: <Eye className="h-4 w-4" /> },
  { key: "payments", label: "Payments", description: "Payment received alerts", icon: <CreditCard className="h-4 w-4" /> },
  { key: "new_hustles", label: "New Hustles Nearby", description: "Hustles posted in your area", icon: <Bell className="h-4 w-4" /> },
  { key: "followers", label: "Followers", description: "New follower notifications", icon: <Users className="h-4 w-4" /> },
  { key: "hustle_expiring", label: "Hustle Reminders", description: "Keep your hustles fresh", icon: <AlertTriangle className="h-4 w-4" /> },
];

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return "system";
  });

  const [pushEnabled, setPushEnabled] = useState(() => {
    return typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted";
  });

  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    try {
      const saved = localStorage.getItem("notif_prefs");
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  };

  const togglePush = async () => {
    if (!pushEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setPushEnabled(true);
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Permission denied. Enable notifications in your browser settings.");
      }
    } else {
      toast.info("To disable push notifications, update your browser notification settings.");
    }
  };

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
  };

  const toggleAll = (value: boolean) => {
    const updated = Object.fromEntries(Object.keys(prefs).map(k => [k, value])) as NotificationPrefs;
    setPrefs(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
    toast.success(value ? "All notifications enabled" : "All notifications disabled");
  };

  const allEnabled = Object.values(prefs).every(Boolean);
  const allDisabled = Object.values(prefs).every(v => !v);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings" description="Manage your Fuse Gigs preferences" path="/settings" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* Theme Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" /> Appearance
            </CardTitle>
            <CardDescription>Choose your preferred theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {([
                { mode: "light" as ThemeMode, icon: <Sun className="h-5 w-5" />, label: "Light" },
                { mode: "dark" as ThemeMode, icon: <Moon className="h-5 w-5" />, label: "Dark" },
                { mode: "system" as ThemeMode, icon: <Monitor className="h-5 w-5" />, label: "System" },
              ]).map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => applyTheme(mode)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                    theme === mode
                      ? "border-primary bg-accent text-accent-foreground shadow-sm"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                  }`}
                >
                  {icon}
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" /> Push Notifications
            </CardTitle>
            <CardDescription>Get browser notifications even when the app is in the background</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                {pushEnabled ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Browser Notifications</p>
                  <p className="text-xs text-muted-foreground">{pushEnabled ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
              <Switch checked={pushEnabled} onCheckedChange={togglePush} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Notification Categories
                </CardTitle>
                <CardDescription>Choose which notifications you want to receive</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAll(!allEnabled)}
              >
                {allEnabled ? "Disable All" : "Enable All"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {NOTIF_CATEGORIES.map(({ key, label, description, icon }, index) => (
              <div key={key}>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      {icon}
                    </div>
                    <div>
                      <Label className="text-sm font-medium cursor-pointer">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <Switch checked={prefs[key]} onCheckedChange={(v) => updatePref(key, v)} />
                </div>
                {index < NOTIF_CATEGORIES.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
