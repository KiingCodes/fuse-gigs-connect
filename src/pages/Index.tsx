import { useHustles, useFeaturedHustles, useCategories } from "@/hooks/useData";
import { useActiveBoostedHustleIds } from "@/hooks/useBoosts";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import HustleCard from "@/components/HustleCard";
import InstallBanner from "@/components/InstallBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Zap, ArrowRight, Users, Briefcase, TrendingUp, Rocket, GraduationCap, CalendarDays, ShoppingBag, MessageCircle, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const Index = () => {
  usePushNotifications();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { data: featuredHustles, isLoading: featuredLoading } = useFeaturedHustles();
  const { data: hustles, isLoading } = useHustles(selectedCategory, search);
  const { data: categories } = useCategories();
  const { data: boostedIds } = useActiveBoostedHustleIds();

  const sortedHustles = hustles ? [...hustles].sort((a, b) => {
    const aB = boostedIds?.has(a.id) ? 1 : 0;
    const bB = boostedIds?.has(b.id) ? 1 : 0;
    return bB - aB;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Discover Local Hustles" path="/" />
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero px-4 py-20 text-center md:py-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="container mx-auto max-w-3xl">
          <Badge className="mb-6 gradient-premium text-premium-foreground border-0 px-4 py-1.5 text-sm font-medium">
            {t("hero.badge")}
          </Badge>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-primary-foreground md:text-6xl">
            {t("hero.title")} <span className="text-primary">{t("hero.titleHighlight")}</span> {t("hero.titleEnd")}
          </h1>
          <p className="mb-8 text-lg text-primary-foreground/70 md:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mx-auto flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t("hero.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="h-12 pl-10 bg-background text-foreground" />
            </div>
            <Link to="/explore">
              <Button className="h-12 gradient-primary text-primary-foreground px-6 gap-2">{t("hero.explore")} <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Install Banner */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <InstallBanner />
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card py-8">
        <div className="container mx-auto grid grid-cols-3 gap-4 px-4 text-center">
          <div>
            <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-foreground">{t("nav.community")}</p>
            <p className="text-sm text-muted-foreground">Growing daily</p>
          </div>
          <div>
            <Briefcase className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-foreground">{t("hero.titleHighlight")}</p>
            <p className="text-sm text-muted-foreground">Real services</p>
          </div>
          <div>
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="text-2xl font-bold text-foreground">Connections</p>
            <p className="text-sm text-muted-foreground">Made every day</p>
          </div>
        </div>
      </section>

      {/* Featured Hustles */}
      {featuredHustles && featuredHustles.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t("section.featured")}</h2>
                <p className="text-muted-foreground">{t("section.featuredSub")}</p>
              </div>
              <Link to="/explore"><Button variant="outline" size="sm" className="gap-1">{t("section.viewAll")} <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredHustles.map((hustle) => (
                <motion.div key={hustle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <HustleCard hustle={hustle} featured isBoosted={boostedIds?.has(hustle.id)} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="mb-6 text-2xl font-bold text-foreground">{t("section.categories")}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant={!selectedCategory ? "default" : "outline"} className={`cursor-pointer px-4 py-2 text-sm transition-all ${!selectedCategory ? "gradient-primary text-primary-foreground border-0" : ""}`} onClick={() => setSelectedCategory(undefined)}>{t("common.all")}</Badge>
              {categories.map((cat) => (
                <Badge key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} className={`cursor-pointer px-4 py-2 text-sm transition-all ${selectedCategory === cat.id ? "gradient-primary text-primary-foreground border-0" : ""}`} onClick={() => setSelectedCategory(cat.id)}>
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Hustles */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-2xl font-bold text-foreground">{t("section.latest")}</h2>
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : sortedHustles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedHustles.map((hustle) => (
                <motion.div key={hustle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <HustleCard hustle={hustle} isBoosted={boostedIds?.has(hustle.id)} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-muted-foreground">{t("section.noHustles")}</p>
              {user && <Link to="/create"><Button className="mt-4 gradient-primary text-primary-foreground">{t("section.postYour")}</Button></Link>}
            </div>
          )}
        </div>
      </section>

      {/* Boost CTA */}
      {user && (
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <Card className="overflow-hidden border-0 gradient-primary shadow-elevated">
              <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-primary-foreground/20 p-3"><Rocket className="h-8 w-8 text-primary-foreground" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">{t("boost.title")}</h3>
                    <p className="text-sm text-primary-foreground/80">{t("boost.subtitle")}</p>
                  </div>
                </div>
                <Link to="/boost"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap"><TrendingUp className="h-4 w-4" /> {t("boost.cta")}</Button></Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Academy, Bookings, Community & Products CTA */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-indigo-700 shadow-elevated">
              <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3"><GraduationCap className="h-8 w-8 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t("cta.academy")}</h3>
                    <p className="text-sm text-white/80">{t("cta.academySub")}</p>
                  </div>
                </div>
                <Link to="/academy"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap">{t("cta.academyBtn")}</Button></Link>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-cyan-700 shadow-elevated">
              <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3"><MessageCircle className="h-8 w-8 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t("cta.community")}</h3>
                    <p className="text-sm text-white/80">{t("cta.communitySub")}</p>
                  </div>
                </div>
                <Link to="/community"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap">{t("cta.communityBtn")}</Button></Link>
              </CardContent>
            </Card>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-orange-600 to-amber-700 shadow-elevated">
              <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3"><ShoppingBag className="h-8 w-8 text-white" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t("cta.products")}</h3>
                    <p className="text-sm text-white/80">{t("cta.productsSub")}</p>
                  </div>
                </div>
                <Link to="/products"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap">{t("cta.productsBtn")}</Button></Link>
              </CardContent>
            </Card>
            {user && (
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-700 shadow-elevated">
                <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 p-3"><CalendarDays className="h-8 w-8 text-white" /></div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{t("cta.bookings")}</h3>
                      <p className="text-sm text-white/80">{t("cta.bookingsSub")}</p>
                    </div>
                  </div>
                  <Link to="/bookings"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap">{t("cta.bookingsBtn")}</Button></Link>
                </CardContent>
              </Card>
            )}
            {user && (
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-pink-600 to-rose-700 shadow-elevated">
                <CardContent className="flex flex-col items-center gap-4 p-8 sm:flex-row sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/20 p-3"><Wallet className="h-8 w-8 text-white" /></div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Multi-Currency Wallet 💰</h3>
                      <p className="text-sm text-white/80">Hold ZAR, USD, NGN, KES & more</p>
                    </div>
                  </div>
                  <Link to="/wallet"><Button variant="secondary" size="lg" className="font-semibold gap-1 whitespace-nowrap">Open Wallet</Button></Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="gradient-primary py-16 text-center">
          <div className="container mx-auto px-4">
            <Zap className="mx-auto mb-4 h-10 w-10 text-primary-foreground" />
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">{t("cta.readyTitle")}</h2>
            <p className="mb-6 text-primary-foreground/80">{t("cta.readySub")}</p>
            <Link to="/auth"><Button size="lg" variant="secondary" className="font-semibold">{t("cta.getStarted")}</Button></Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={logo} alt="Fuse Gigs Logo" className="h-8 w-8 object-contain" />
            <span className="font-bold text-foreground">Fuse Gigs</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Fuse Gigs. {t("footer.tagline")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
