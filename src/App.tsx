import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { DataModeProvider } from "@/contexts/DataModeContext";
import { HelmetProvider } from "react-helmet-async";
import CookieConsent from "@/components/CookieConsent";
import VersionBanner from "@/components/VersionBanner";
import { lazy, Suspense } from "react";

// Eagerly loaded (homepage)
import Index from "./pages/Index";

// Lazy loaded pages
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const CreateHustle = lazy(() => import("./pages/CreateHustle"));
const EditHustle = lazy(() => import("./pages/EditHustle"));
const Explore = lazy(() => import("./pages/Explore"));
const HustleDetail = lazy(() => import("./pages/HustleDetail"));
const Conversations = lazy(() => import("./pages/Conversations"));
const Chat = lazy(() => import("./pages/Chat"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const BoostHustle = lazy(() => import("./pages/BoostHustle"));
const Academy = lazy(() => import("./pages/Academy"));
const Bookings = lazy(() => import("./pages/Bookings"));
const SavedHustles = lazy(() => import("./pages/SavedHustles"));
const Settings = lazy(() => import("./pages/Settings"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Community = lazy(() => import("./pages/Community"));
const Products = lazy(() => import("./pages/Products"));
const Wallet = lazy(() => import("./pages/Wallet"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 min stale time for better caching
      gcTime: 1000 * 60 * 10, // 10 min garbage collection
    },
  },
});

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <DataModeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <CookieConsent />
              <BrowserRouter>
                <VersionBanner />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create" element={<CreateHustle />} />
                    <Route path="/edit/:id" element={<EditHustle />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/hustle/:id" element={<HustleDetail />} />
                    <Route path="/messages" element={<Conversations />} />
                    <Route path="/chat/:id" element={<Chat />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/boost" element={<BoostHustle />} />
                    <Route path="/boost/:hustleId" element={<BoostHustle />} />
                    <Route path="/academy" element={<Academy />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/saved" element={<SavedHustles />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/u/:userId" element={<PublicProfile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </DataModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
