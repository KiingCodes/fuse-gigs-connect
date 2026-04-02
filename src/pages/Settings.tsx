import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Moon, Sun, Monitor, Bell, BellOff, MessageSquare, CalendarDays, Rocket, Star,
  Shield, Heart, GraduationCap, Trophy, Eye, CreditCard, Users, AlertTriangle,
  Sparkles, UserCog, Lock, MapPin, Trash2, Save, EyeOff,
} from "lucide-react";
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

interface PrivacyPrefs {
  showLocation: boolean;
  showPhone: boolean;
  showEmail: boolean;
  profileVisible: boolean;
  allowMessages: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  messages: true, bookings: true, booking_reminders: true, reviews: true,
  boosts: true, verification: true, hustle_saved: true, inquiries: true,
  academy: true, milestones: true, profile_views: true, payments: true,
  new_hustles: true, followers: true, hustle_expiring: true, welcome: true,
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  showLocation: true, showPhone: false, showEmail: false, profileVisible: true, allowMessages: true,
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

const PRIVACY_ITEMS: { key: keyof PrivacyPrefs; label: string; description: string; icon: React.ReactNode }[] = [
  { key: "profileVisible", label: "Public Profile", description: "Allow others to see your profile", icon: <Eye className="h-4 w-4" /> },
  { key: "showLocation", label: "Show Location", description: "Display your location on profile", icon: <MapPin className="h-4 w-4" /> },
  { key: "showPhone", label: "Show Phone Number", description: "Make phone visible to other users", icon: <Shield className="h-4 w-4" /> },
  { key: "showEmail", label: "Show Email", description: "Make email visible to other users", icon: <EyeOff className="h-4 w-4" /> },
  { key: "allowMessages", label: "Allow Messages", description: "Let others send you direct messages", icon: <MessageSquare className="h-4 w-4" /> },
];

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return "system";
  });

  const [pushEnabled, setPushEnabled] = useState(() =>
    typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted"
  );

  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    try {
      const saved = localStorage.getItem("notif_prefs");
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
    } catch { return DEFAULT_PREFS; }
  });

  const [privacy, setPrivacy] = useState<PrivacyPrefs>(() => {
    try {
      const saved = localStorage.getItem("privacy_prefs");
      return saved ? { ...DEFAULT_PRIVACY, ...JSON.parse(saved) } : DEFAULT_PRIVACY;
    } catch { return DEFAULT_PRIVACY; }
  });

  useEffect(() => {
    if (!user) navigate("/auth");
  }, [user, navigate]);

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || "");
    if (user) setEmail(user.email || "");
  }, [profile, user]);

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

  const handleSaveProfile = async () => {
    if (!displayName.trim()) { toast.error("Display name cannot be empty"); return; }
    setSavingProfile(true);
    try {
      await updateProfile.mutateAsync({ display_name: displayName.trim() });
      toast.success("Display name updated!");
    } catch { toast.error("Failed to update display name"); }
    setSavingProfile(false);
  };

  const handleUpdateEmail = async () => {
    if (!email.trim() || email === user?.email) return;
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      toast.success("Verification email sent to your new address. Check your inbox.");
    } catch (err: any) { toast.error(err.message || "Failed to update email"); }
    setSavingEmail(false);
  };

  const handleDeleteAccount = async () => {
    toast.info("Account deletion request submitted. Your account will be deactivated. Contact support to complete deletion.");
    await signOut();
    navigate("/");
  };

  const togglePush = async () => {
    if (!pushEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) { setPushEnabled(true); toast.success("Push notifications enabled!"); }
      else { toast.error("Permission denied. Enable in browser settings."); }
    } else {
      toast.info("To disable, update your browser notification settings.");
    }
  };

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
  };

  const toggleAll = (value: boolean) => {
    const updated = Object.fromEntries(Object.keys(prefs).map(k => [k, value])) as unknown as NotificationPrefs;
    setPrefs(updated);
    localStorage.setItem("notif_prefs", JSON.stringify(updated));
    toast.success(value ? "All notifications enabled" : "All notifications disabled");
  };

  const updatePrivacy = (key: keyof PrivacyPrefs, value: boolean) => {
    const updated = { ...privacy, [key]: value };
    setPrivacy(updated);
    localStorage.setItem("privacy_prefs", JSON.stringify(updated));
    toast.success("Privacy setting updated");
  };

  const allEnabled = Object.values(prefs).every(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Settings" description="Manage your Fuse Gigs preferences" path="/settings" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6 pb-20">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" /> Account
            </CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
              <div className="flex gap-2">
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="flex-1" />
                <Button size="sm" onClick={handleSaveProfile} disabled={savingProfile || displayName === profile?.display_name} className="gap-1">
                  <Save className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="flex gap-2">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="flex-1" />
                <Button size="sm" variant="outline" onClick={handleUpdateEmail} disabled={savingEmail || email === user?.email} className="gap-1">
                  {savingEmail ? "Sending..." : "Update"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">A verification email will be sent to confirm the change.</p>
            </div>

            <Separator />

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Password</Label>
              <Button variant="outline" size="sm" className="gap-1" onClick={async () => {
                if (!user?.email) return;
                const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/reset-password` });
                if (error) toast.error(error.message);
                else toast.success("Password reset email sent!");
              }}>
                <Lock className="h-4 w-4" /> Change Password
              </Button>
              <p className="text-xs text-muted-foreground">We'll send a reset link to your email.</p>
            </div>
          </CardContent>
        </Card>

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

        {/* Privacy Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Privacy
            </CardTitle>
            <CardDescription>Control what others can see</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {PRIVACY_ITEMS.map(({ key, label, description, icon }, index) => (
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
                  <Switch checked={privacy[key]} onCheckedChange={(v) => updatePrivacy(key, v)} />
                </div>
                {index < PRIVACY_ITEMS.length - 1 && <Separator />}
              </div>
            ))}
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
              <Button variant="outline" size="sm" onClick={() => toggleAll(!allEnabled)}>
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

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions — proceed with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Delete Account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="gap-1">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account, all your hustles, bookings, messages, and other data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Delete My Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
