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
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateHustle from "./pages/CreateHustle";
import EditHustle from "./pages/EditHustle";
import Explore from "./pages/Explore";
import HustleDetail from "./pages/HustleDetail";
import Conversations from "./pages/Conversations";
import Chat from "./pages/Chat";
import AdminPanel from "./pages/AdminPanel";
import BoostHustle from "./pages/BoostHustle";
import Academy from "./pages/Academy";
import Bookings from "./pages/Bookings";
import SavedHustles from "./pages/SavedHustles";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import Community from "./pages/Community";
import Products from "./pages/Products";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </DataModeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
