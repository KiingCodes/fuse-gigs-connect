import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, LayoutDashboard, User, LogOut, Menu, X, MessageSquare, Shield, GraduationCap, CalendarDays, Heart, Settings } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import NotificationBell from "@/components/NotificationBell";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useIsAdmin } from "@/hooks/useAdmin";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Fuse Gigs Logo" className="h-12 w-12 object-contain" />
          <span className="text-xl font-bold text-foreground">Fuse Gigs</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <DarkModeToggle />
          <Link to="/explore">
            <Button variant="ghost" size="sm">Explore</Button>
          </Link>
          <Link to="/academy">
            <Button variant="ghost" size="sm" className="gap-1"><GraduationCap className="h-4 w-4" /> Academy</Button>
          </Link>
          {user ? (
            <>
              <Link to="/create">
                <Button size="sm" className="gradient-primary text-primary-foreground gap-1">
                  <Plus className="h-4 w-4" /> Post Hustle
                </Button>
              </Link>
              <Link to="/saved">
                <Button variant="ghost" size="icon" className="rounded-full" title="Saved">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/bookings">
                <Button variant="ghost" size="icon" className="rounded-full" title="Bookings">
                  <CalendarDays className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {profile?.display_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex justify-end"><DarkModeToggle /></div>
            <Link to="/explore" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Explore</Button>
            </Link>
            <Link to="/academy" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" /> Academy
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/create" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full gradient-primary text-primary-foreground gap-1">
                    <Plus className="h-4 w-4" /> Post Hustle
                  </Button>
                </Link>
                <Link to="/saved" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="mr-2 h-4 w-4" /> Saved
                  </Button>
                </Link>
                <Link to="/bookings" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <CalendarDays className="mr-2 h-4 w-4" /> Bookings
                  </Button>
                </Link>
                <Link to="/messages" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageSquare className="mr-2 h-4 w-4" /> Messages
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" /> Admin Panel
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); setMobileOpen(false); }}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gradient-primary text-primary-foreground">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
