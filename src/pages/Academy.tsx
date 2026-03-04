import { useState } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, TrendingUp, Users, DollarSign, Megaphone, HeartHandshake,
  BookOpen, Play, CheckCircle, Clock, Star, Lightbulb, Target, BarChart3,
  Shield, Smartphone, Globe, MessageSquare, Palette, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  tips: string[];
}

const LESSONS: Lesson[] = [
  // Business Growth
  {
    id: "1", title: "Starting Your Side Hustle", description: "Learn how to turn your skills into a profitable business from scratch.", duration: "15 min", icon: <Lightbulb className="h-6 w-6" />, difficulty: "Beginner", category: "business",
    tips: ["Identify your unique skills and what people need", "Start small — offer to friends and family first", "Set up a simple pricing structure", "Create a basic portfolio with phone photos", "Register on Fuse Gigs to reach customers"]
  },
  {
    id: "2", title: "Scaling From 1 to 100 Customers", description: "Strategies to grow your customer base consistently.", duration: "20 min", icon: <TrendingUp className="h-6 w-6" />, difficulty: "Intermediate", category: "business",
    tips: ["Ask every happy customer for a referral", "Offer a small discount for repeat business", "Partner with complementary hustlers", "Use WhatsApp Business for professional communication", "Track your best-performing services and double down"]
  },
  {
    id: "3", title: "Setting the Right Prices", description: "Price your services competitively without underselling yourself.", duration: "12 min", icon: <Target className="h-6 w-6" />, difficulty: "Beginner", category: "business",
    tips: ["Research what competitors charge in your area", "Factor in your costs: transport, materials, time", "Start slightly below market rate then increase as you build reputation", "Offer packages (e.g. 3 sessions for price of 2.5)", "Never work for free — even for exposure"]
  },
  // Marketing
  {
    id: "4", title: "Social Media for Hustlers", description: "Build your brand on WhatsApp, Instagram, Facebook and TikTok.", duration: "18 min", icon: <Smartphone className="h-6 w-6" />, difficulty: "Beginner", category: "marketing",
    tips: ["Post your work on WhatsApp Status daily", "Create before/after content to showcase results", "Use relevant hashtags on Instagram and TikTok", "Reply to every comment and DM promptly", "Share customer testimonials (with permission)"]
  },
  {
    id: "5", title: "Getting 5-Star Reviews", description: "Turn satisfied customers into your best marketing asset.", duration: "10 min", icon: <Star className="h-6 w-6" />, difficulty: "Beginner", category: "marketing",
    tips: ["Always follow up after completing a job", "Make it easy — send a link to leave a review", "Address complaints immediately and offer solutions", "Screenshot great WhatsApp feedback for your portfolio", "Respond to all reviews, good and bad"]
  },
  {
    id: "6", title: "Creating a Personal Brand", description: "Stand out from competitors with a memorable hustler brand.", duration: "15 min", icon: <Palette className="h-6 w-6" />, difficulty: "Intermediate", category: "marketing",
    tips: ["Choose a catchy business name that's easy to remember", "Use consistent colors and fonts across all platforms", "Write a compelling bio that highlights your unique value", "Invest in a simple logo (or use Canva)", "Dress professionally and brand your equipment"]
  },
  // Customer Service
  {
    id: "7", title: "Handling Difficult Customers", description: "Turn complaints into opportunities and keep your reputation strong.", duration: "14 min", icon: <HeartHandshake className="h-6 w-6" />, difficulty: "Intermediate", category: "customer-service",
    tips: ["Listen fully before responding — don't get defensive", "Apologize for the experience, not necessarily the fault", "Offer a concrete solution within 24 hours", "Follow up to ensure they're satisfied with the resolution", "Learn from every complaint to improve your service"]
  },
  {
    id: "8", title: "Communication That Wins Clients", description: "Professional messaging that converts inquiries into bookings.", duration: "12 min", icon: <MessageSquare className="h-6 w-6" />, difficulty: "Beginner", category: "customer-service",
    tips: ["Respond to inquiries within 30 minutes during business hours", "Use professional greetings and sign-offs", "Be clear about what's included in your service", "Send a confirmation message after every booking", "Follow up 24 hours before the appointment"]
  },
  {
    id: "9", title: "Building Customer Loyalty", description: "Keep customers coming back again and again.", duration: "16 min", icon: <Users className="h-6 w-6" />, difficulty: "Advanced", category: "customer-service",
    tips: ["Remember customer preferences and names", "Send birthday or holiday greetings", "Create a simple loyalty program (every 5th service 20% off)", "Surprise customers with small extras", "Ask for feedback regularly and act on it"]
  },
  // Financial Literacy
  {
    id: "10", title: "Money Management 101", description: "Separate business and personal finances for sustainable growth.", duration: "20 min", icon: <DollarSign className="h-6 w-6" />, difficulty: "Beginner", category: "finance",
    tips: ["Open a separate bank account for your hustle", "Track every rand that comes in and goes out", "Save at least 20% of every payment for taxes and emergencies", "Use free tools like spreadsheets to track finances", "Pay yourself a fixed amount — don't dip into business funds"]
  },
  {
    id: "11", title: "Pricing for Profit", description: "Understand your costs and margins to actually make money.", duration: "15 min", icon: <BarChart3 className="h-6 w-6" />, difficulty: "Intermediate", category: "finance",
    tips: ["Calculate your true hourly rate (include travel, prep, cleanup)", "Know your break-even point for every service", "Review and adjust prices every 3 months", "Factor in seasonal demand — charge more during peak times", "Don't compete on price alone — compete on quality"]
  },
  {
    id: "12", title: "Tax Basics for Side Hustlers", description: "Stay legal and avoid surprises at tax time.", duration: "18 min", icon: <Shield className="h-6 w-6" />, difficulty: "Advanced", category: "finance",
    tips: ["Register as a provisional taxpayer if earning above threshold", "Keep receipts for all business expenses", "Understand which expenses are tax-deductible", "Set aside money monthly for tax payments", "Consider consulting a tax professional once you're established"]
  },
];

const CATEGORIES = [
  { id: "all", label: "All Lessons", icon: <BookOpen className="h-4 w-4" /> },
  { id: "business", label: "Business Growth", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" /> },
  { id: "customer-service", label: "Customer Service", icon: <HeartHandshake className="h-4 w-4" /> },
  { id: "finance", label: "Financial Literacy", icon: <DollarSign className="h-4 w-4" /> },
];

const difficultyColor = (d: string) => {
  if (d === "Beginner") return "bg-success/10 text-success border-success/20";
  if (d === "Intermediate") return "bg-primary/10 text-primary border-primary/20";
  return "bg-destructive/10 text-destructive border-destructive/20";
};

const Academy = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const filteredLessons = activeCategory === "all" ? LESSONS : LESSONS.filter(l => l.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Hustler Academy - Learn & Grow" description="Free business growth tips, marketing lessons, customer service training, and financial literacy for hustlers." path="/academy" />
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="container mx-auto max-w-3xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <Badge className="mb-4 gradient-premium text-premium-foreground border-0 px-4 py-1.5">Free Learning Hub</Badge>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-primary-foreground md:text-5xl">
            Hustler Academy
          </h1>
          <p className="text-lg text-primary-foreground/70">
            Level up your hustle with practical tips on business, marketing, customer service & money management.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-primary-foreground/60 text-sm">
            <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {LESSONS.length} Lessons</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ~3 hours total</span>
            <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> 100% Free</span>
          </div>
        </motion.div>
      </section>

      {/* Progress Overview */}
      <section className="border-b border-border bg-card py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.filter(c => c.id !== "all").map(cat => {
              const count = LESSONS.filter(l => l.category === cat.id).length;
              return (
                <div key={cat.id} className="text-center">
                  <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    {cat.icon}
                  </div>
                  <p className="text-sm font-medium text-foreground">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{count} lessons</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className={`gap-1.5 ${activeCategory === cat.id ? "gradient-primary text-primary-foreground border-0" : ""}`}
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>

          {/* Lesson Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-elevated ${expandedLesson === lesson.id ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {lesson.icon}
                      </div>
                      <Badge variant="outline" className={`text-xs ${difficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg">{lesson.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lesson.duration}</span>
                    </div>
                  </CardHeader>

                  {expandedLesson === lesson.id && (
                    <CardContent className="pt-0">
                      <div className="border-t border-border pt-4">
                        <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Lightbulb className="h-4 w-4 text-primary" /> Key Takeaways
                        </h4>
                        <ul className="space-y-2">
                          {lesson.tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="gradient-primary py-12 text-center">
          <div className="container mx-auto px-4">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-primary-foreground" />
            <h2 className="mb-3 text-2xl font-bold text-primary-foreground">Ready to Apply What You've Learned?</h2>
            <p className="mb-6 text-primary-foreground/80">Join Fuse Gigs and start your hustle today.</p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="font-semibold">Get Started Free</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Academy;
