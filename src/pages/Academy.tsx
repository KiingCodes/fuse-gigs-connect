import { useState } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap, TrendingUp, Users, DollarSign, Megaphone, HeartHandshake,
  BookOpen, CheckCircle, Clock, Star, Lightbulb, Target, BarChart3,
  Shield, Smartphone, MessageSquare, Palette, Zap
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
  deepDive: string[];
  actionSteps: string[];
  commonMistakes: string[];
}

const LESSONS: Lesson[] = [
  {
    id: "1", title: "Starting Your Side Hustle", description: "Learn how to turn your skills into a profitable business from scratch.", duration: "25 min", icon: <Lightbulb className="h-6 w-6" />, difficulty: "Beginner", category: "business",
    tips: ["Identify your unique skills and what people need", "Start small — offer to friends and family first", "Set up a simple pricing structure", "Create a basic portfolio with phone photos", "Register on Fuse Gigs to reach customers"],
    deepDive: [
      "Every successful hustle starts with solving a real problem. Walk through your neighbourhood and list 10 things people struggle with — cleaning, repairs, transport, food, childcare. Your skills probably match at least 3 of these.",
      "Validation before investment: Before spending money on tools or branding, offer your service to 5 people for free or at a deep discount. Their feedback will shape your offering better than any business plan.",
      "Your first 'office' is your phone. Set up WhatsApp Business (it's free), create a professional profile photo, write a clear status about what you offer, and save your business hours.",
      "Document everything from day one. Take before/after photos, screenshot positive WhatsApp messages, note what worked. This becomes your portfolio and marketing material."
    ],
    actionSteps: ["Write down 5 skills you have that people would pay for", "Ask 3 friends what service they wish existed nearby", "Create a WhatsApp Business profile today", "Set your first 3 prices (basic, standard, premium)"],
    commonMistakes: ["Waiting until everything is 'perfect' to start", "Not telling anyone about your new hustle", "Trying to offer too many services at once", "Copying competitors instead of finding your unique angle"]
  },
  {
    id: "2", title: "Scaling From 1 to 100 Customers", description: "Strategies to grow your customer base consistently.", duration: "30 min", icon: <TrendingUp className="h-6 w-6" />, difficulty: "Intermediate", category: "business",
    tips: ["Ask every happy customer for a referral", "Offer a small discount for repeat business", "Partner with complementary hustlers", "Use WhatsApp Business for professional communication", "Track your best-performing services and double down"],
    deepDive: [
      "The Referral Engine: After every completed job, send a message: 'Thanks for choosing me! If you know anyone who needs [service], I'd appreciate the referral. I'll give you R50 off your next booking for every friend you send.' This single habit can double your customers in 3 months.",
      "Strategic partnerships are gold. If you do hair, partner with a nail tech. If you do plumbing, partner with an electrician. Cross-refer customers and you both grow. Create a WhatsApp group with 5-10 complementary hustlers.",
      "The '80/20 Rule' for hustlers: 80% of your income likely comes from 20% of your services. Track which services get the most bookings and best reviews. Focus your marketing and time on those. Drop services that drain your energy for little return.",
      "Systemise your operations: Create template messages for quotes, confirmations, and follow-ups. Use a simple spreadsheet to track customers, payments, and appointments. When things are consistent, customers trust you more."
    ],
    actionSteps: ["Create a referral reward system and tell 10 existing customers", "Identify 3 complementary hustlers and propose a partnership", "Track your services for 2 weeks and identify your top earners", "Create 5 template messages for common customer interactions"],
    commonMistakes: ["Not following up after a job is done", "Lowering prices to compete instead of improving quality", "Ignoring unhappy customers instead of solving their problems", "Growing too fast without systems in place"]
  },
  {
    id: "3", title: "Setting the Right Prices", description: "Price your services competitively without underselling yourself.", duration: "20 min", icon: <Target className="h-6 w-6" />, difficulty: "Beginner", category: "business",
    tips: ["Research what competitors charge in your area", "Factor in your costs: transport, materials, time", "Start slightly below market rate then increase as you build reputation", "Offer packages (e.g. 3 sessions for price of 2.5)", "Never work for free — even for exposure"],
    deepDive: [
      "The True Cost Formula: Most hustlers undercharge because they forget hidden costs. Calculate: Materials + Transport + Your time (minimum R100/hr) + Equipment wear + 20% profit margin = Your minimum price. If your calculation shows you should charge R300 but competitors charge R250, you need to either reduce costs or justify the premium with better service.",
      "Pricing psychology works: R299 feels cheaper than R300. Offering 3 tiers (Basic R150, Standard R250, Premium R400) pushes most customers to the middle option. Always present your premium option first — it makes the standard seem like a deal.",
      "When to raise prices: After every 10 completed jobs with good feedback, increase by 5-10%. After getting verified on Fuse Gigs, increase by 10-15%. Loyal customers will stay; price-sensitive customers weren't your ideal market anyway.",
      "Package deals increase average order value: Instead of charging R200 per haircut, offer 'Monthly Package: 4 cuts for R700 (save R100)'. The customer saves money, you guarantee recurring income. Win-win."
    ],
    actionSteps: ["Calculate your true hourly rate including all hidden costs", "Research 5 competitors' prices in your area", "Create 3 pricing tiers for your main service", "Set a calendar reminder to review prices every 3 months"],
    commonMistakes: ["Charging what you think you deserve instead of what the market supports", "Not factoring transport and material costs", "Giving discounts without getting something in return (referral, review)", "Being afraid to talk about money with customers"]
  },
  {
    id: "4", title: "Social Media for Hustlers", description: "Build your brand on WhatsApp, Instagram, Facebook and TikTok.", duration: "25 min", icon: <Smartphone className="h-6 w-6" />, difficulty: "Beginner", category: "marketing",
    tips: ["Post your work on WhatsApp Status daily", "Create before/after content to showcase results", "Use relevant hashtags on Instagram and TikTok", "Reply to every comment and DM promptly", "Share customer testimonials (with permission)"],
    deepDive: [
      "WhatsApp is your #1 marketing tool in SA. Post to your Status at least 3 times daily: morning (motivational/behind-the-scenes), afternoon (work in progress/results), evening (availability for tomorrow). Your contacts see these and word spreads.",
      "Content that converts: Before/after photos get 3x more engagement than regular posts. Film 15-second TikToks of you working — people love watching skilled hands at work. Use trending sounds on TikTok and Reels for extra reach.",
      "The 80/20 content rule: 80% valuable content (tips, results, behind-the-scenes), 20% promotional (prices, booking links). Nobody follows an account that only posts 'Book now!' Instead, show your expertise and let people come to you.",
      "Engage, don't just post: Comment on your customers' posts, reply to every DM within 1 hour, create polls in your WhatsApp Status ('Which style do you prefer? A or B?'). Engagement builds relationships; relationships build businesses."
    ],
    actionSteps: ["Set up WhatsApp Business with a professional profile", "Take 5 before/after photos of your recent work", "Create your first TikTok or Reel showing your work process", "Post to WhatsApp Status 3 times today"],
    commonMistakes: ["Posting only when you need customers (be consistent daily)", "Using poor lighting for photos", "Not responding to DMs quickly", "Deleting posts that don't get many likes — consistency matters more than virality"]
  },
  {
    id: "5", title: "Getting 5-Star Reviews", description: "Turn satisfied customers into your best marketing asset.", duration: "20 min", icon: <Star className="h-6 w-6" />, difficulty: "Beginner", category: "marketing",
    tips: ["Always follow up after completing a job", "Make it easy — send a link to leave a review", "Address complaints immediately and offer solutions", "Screenshot great WhatsApp feedback for your portfolio", "Respond to all reviews, good and bad"],
    deepDive: [
      "The perfect follow-up sequence: 1) Thank them immediately after the job. 2) Check in 24 hours later ('How's everything? Happy with the results?'). 3) After positive response, ask for a review ('Would you mind leaving a quick review on Fuse Gigs? It really helps my business grow.').",
      "Handling negative feedback is where legends are made. Never argue publicly. Instead: Acknowledge their frustration, apologize for the experience, offer a specific solution (redo, refund, discount), and follow up. 70% of unhappy customers become loyal if you resolve their issue well.",
      "Social proof snowball: Once you have 5+ reviews, new customers are 4x more likely to book. Display your best reviews on WhatsApp Status, your Fuse Gigs profile, and any social media. Create a 'Reviews Highlight' on Instagram.",
      "Ask at the right moment: The best time to ask for a review is when the customer expresses satisfaction — 'Oh wow, this looks amazing!' — That's your cue: 'So glad you love it! Would you mind sharing that on Fuse Gigs?'"
    ],
    actionSteps: ["Send follow-up messages to your last 5 customers", "Create a template review request message", "Screenshot your best 3 WhatsApp testimonials", "Respond to any existing reviews you haven't replied to"],
    commonMistakes: ["Only asking for reviews from customers you think will give 5 stars", "Taking negative feedback personally", "Not responding to reviews at all", "Offering payment for reviews (this destroys trust)"]
  },
  {
    id: "6", title: "Creating a Personal Brand", description: "Stand out from competitors with a memorable hustler brand.", duration: "25 min", icon: <Palette className="h-6 w-6" />, difficulty: "Intermediate", category: "marketing",
    tips: ["Choose a catchy business name that's easy to remember", "Use consistent colors and fonts across all platforms", "Write a compelling bio that highlights your unique value", "Invest in a simple logo (or use Canva)", "Dress professionally and brand your equipment"],
    deepDive: [
      "Your brand is a promise. It's not just a logo — it's the feeling people get when they think of your business. Ask yourself: What 3 words should customers use to describe working with me? (e.g., 'reliable, skilled, friendly'). Every decision should reinforce these words.",
      "The 5-second test: If someone sees your WhatsApp profile, Fuse Gigs listing, or business card for 5 seconds, can they tell what you do and why you're good? If not, simplify. Clear beats clever every time.",
      "Consistency builds recognition: Use the same profile photo, business name, and color scheme everywhere. When people see your orange (or whatever color you choose) across WhatsApp, Fuse Gigs, and Instagram, they start to recognise and trust you.",
      "Your story is your differentiator: 'I started fixing phones from my bedroom in Tembisa and now serve 50+ customers monthly' is more memorable than 'Professional phone repair service.' People connect with stories, not features."
    ],
    actionSteps: ["Write down your 3 brand words", "Create a simple logo using Canva (free)", "Update all your profiles with consistent branding", "Write a 2-sentence brand story"],
    commonMistakes: ["Copying another business's brand instead of creating your own", "Changing your brand every few months", "Focusing on the logo before defining your values", "Using different names on different platforms"]
  },
  {
    id: "7", title: "Handling Difficult Customers", description: "Turn complaints into opportunities and keep your reputation strong.", duration: "20 min", icon: <HeartHandshake className="h-6 w-6" />, difficulty: "Intermediate", category: "customer-service",
    tips: ["Listen fully before responding — don't get defensive", "Apologize for the experience, not necessarily the fault", "Offer a concrete solution within 24 hours", "Follow up to ensure they're satisfied with the resolution", "Learn from every complaint to improve your service"],
    deepDive: [
      "The HEARD framework for complaints: Hear them out fully. Empathise ('I understand your frustration'). Apologise for the experience. Resolve with a specific action. Deliver on your promise and follow up. This turns 7 out of 10 angry customers into loyal fans.",
      "Set boundaries professionally: Some customers are unreasonable. It's OK to say 'I want to make this right. Here's what I can offer...' If they continue being abusive, calmly say 'I respect your feedback, but I can't continue this conversation with this tone. Let's revisit when we've both had time to think.'",
      "Prevention is better than cure: 90% of complaints come from mismatched expectations. Before starting any job, clearly state: what's included, what's not included, timeline, and price. Get agreement in writing (WhatsApp message is fine). This is your safety net.",
      "Document difficult interactions: Screenshot conversations (for your records, not to share publicly). If a customer makes false claims, you have evidence. Also track complaint patterns — if 3 customers complain about the same thing, that's a process problem to fix."
    ],
    actionSteps: ["Create a clear 'what's included' list for your main service", "Practice the HEARD framework with a friend", "Write a professional response template for complaints", "Review your last complaint and identify what you'd do differently"],
    commonMistakes: ["Getting defensive or arguing back", "Ignoring complaints hoping they'll go away", "Offering refunds too quickly without understanding the issue", "Bad-mouthing difficult customers to other clients"]
  },
  {
    id: "8", title: "Communication That Wins Clients", description: "Professional messaging that converts inquiries into bookings.", duration: "20 min", icon: <MessageSquare className="h-6 w-6" />, difficulty: "Beginner", category: "customer-service",
    tips: ["Respond to inquiries within 30 minutes during business hours", "Use professional greetings and sign-offs", "Be clear about what's included in your service", "Send a confirmation message after every booking", "Follow up 24 hours before the appointment"],
    deepDive: [
      "The 30-minute rule: Studies show that responding within 30 minutes makes you 7x more likely to win the booking compared to responding after 1 hour. Set up notifications on Fuse Gigs and WhatsApp. Even a quick 'Hi! Thanks for reaching out. Let me get back to you with details shortly' is better than silence.",
      "The Perfect Quote Message Template: 'Hi [Name]! 👋 Thanks for your interest in [service]. Here's what I can offer:\n\n✅ [What's included]\n💰 Price: R[amount]\n⏰ Duration: [time]\n📍 Location: [where]\n\nWould you like to book? I have availability on [date/time].'",
      "Reading between the lines: When a customer asks 'How much?', they're not just asking about price — they want to know if you're professional, reliable, and worth it. Your response should answer all three: clear pricing, professional tone, and social proof ('I've done 50+ of these with great feedback').",
      "The confirmation and reminder system: Immediately after booking → send confirmation with date, time, address, and what to prepare. 24 hours before → send a friendly reminder. 1 hour before → 'On my way!' or 'See you soon!' This reduces no-shows by 60%."
    ],
    actionSteps: ["Turn on push notifications for Fuse Gigs and WhatsApp", "Create 3 template messages: quote, confirmation, reminder", "Practice your quote message by sending it to a friend for feedback", "Set your business hours on WhatsApp Business"],
    commonMistakes: ["Using slang or poor grammar in business messages", "Sending voice notes for initial quotes (text is more professional)", "Not confirming bookings in writing", "Disappearing after the customer says they'll 'think about it'"]
  },
  {
    id: "9", title: "Building Customer Loyalty", description: "Keep customers coming back again and again.", duration: "25 min", icon: <Users className="h-6 w-6" />, difficulty: "Advanced", category: "customer-service",
    tips: ["Remember customer preferences and names", "Send birthday or holiday greetings", "Create a simple loyalty program (every 5th service 20% off)", "Surprise customers with small extras", "Ask for feedback regularly and act on it"],
    deepDive: [
      "It costs 5x more to get a new customer than to keep an existing one. A customer who books 3 times is worth more than 10 one-time customers. Focus your energy on retention, not just acquisition.",
      "The Customer Memory System: Keep notes on each regular customer — their name, what they like, previous services, any preferences. 'Hi Sarah, same style as last time, right? And I remember you prefer the shorter length on the sides.' This personal touch makes people feel valued.",
      "Loyalty programs that work in SA: Punch card (digital or physical) — every 5th visit gets 20% off. Birthday month special — 15% off during their birthday month. Referral reward — R50 credit for every friend they send. VIP list — early access to new services or time slots.",
      "The surprise and delight factor: Occasionally throw in a small extra for free — a bonus product sample, 10 extra minutes, a small upgrade. Don't announce it in advance; the surprise makes it memorable. These moments get talked about and shared on social media."
    ],
    actionSteps: ["Start a customer notes system (spreadsheet or notes app)", "Design a simple loyalty program for your top service", "Send a check-in message to 3 past customers today", "Plan one 'surprise and delight' moment for this week"],
    commonMistakes: ["Treating loyal customers the same as new ones (they deserve better)", "Only contacting customers when you want their business", "Making loyalty programs too complicated", "Not tracking who your repeat customers are"]
  },
  {
    id: "10", title: "Money Management 101", description: "Separate business and personal finances for sustainable growth.", duration: "30 min", icon: <DollarSign className="h-6 w-6" />, difficulty: "Beginner", category: "finance",
    tips: ["Open a separate bank account for your hustle", "Track every rand that comes in and goes out", "Save at least 20% of every payment for taxes and emergencies", "Use free tools like spreadsheets to track finances", "Pay yourself a fixed amount — don't dip into business funds"],
    deepDive: [
      "The Jar System for hustlers: Every payment you receive, split it mentally (or physically) into jars: 50% Operating costs (materials, transport, airtime), 20% Savings & emergency fund, 20% Pay yourself, 10% Growth fund (marketing, tools, education). This simple system prevents the feast-or-famine cycle.",
      "Open a separate bank account TODAY. Most SA banks offer free or cheap business accounts. FNB Easy Account, Capitec Business, TymeBank — all work. Having separate accounts means you can see exactly how your business is performing without mixing personal spending.",
      "The 'Invoice Everything' habit: Even for cash jobs, create a simple invoice (free apps like Wave or even a WhatsApp message): Date, customer name, service, amount, payment method. This creates a paper trail for tax purposes and looks professional.",
      "Emergency fund reality: Most hustlers are one bad month away from closing. Aim to save 3 months of operating expenses. Start with R500/month if that's all you can manage. The peace of mind is worth it — you'll make better decisions when you're not desperate for the next payment."
    ],
    actionSteps: ["Open a separate bank account for your business this week", "Download a free expense tracking app or create a spreadsheet", "Calculate your monthly operating costs", "Set up an automatic transfer of 20% of each payment to savings"],
    commonMistakes: ["Mixing personal and business money", "Not tracking small expenses (they add up!)", "Spending profits on lifestyle instead of reinvesting", "Not having any emergency savings"]
  },
  {
    id: "11", title: "Pricing for Profit", description: "Understand your costs and margins to actually make money.", duration: "25 min", icon: <BarChart3 className="h-6 w-6" />, difficulty: "Intermediate", category: "finance",
    tips: ["Calculate your true hourly rate (include travel, prep, cleanup)", "Know your break-even point for every service", "Review and adjust prices every 3 months", "Factor in seasonal demand — charge more during peak times", "Don't compete on price alone — compete on quality"],
    deepDive: [
      "The True Hourly Rate revelation: Most hustlers think they earn R200/hr because they charge R200 for a 1-hour job. Reality: 30 min travel + 15 min setup + 60 min work + 15 min cleanup + 30 min travel back = 2.5 hours. True rate: R80/hr. Knowing this changes everything about how you price.",
      "Break-even analysis made simple: List ALL your monthly fixed costs (phone bill, data, transport, supplies). Divide by your average job price. That's how many jobs you need just to cover costs. Everything above that is profit. Example: R3,000 costs ÷ R250/job = 12 jobs just to break even.",
      "Seasonal pricing strategy: December, Easter, and Heritage Day are peak times for many services. Hair braiders, event planners, cleaners — all see more demand. Increase prices 15-25% during peak and offer early-bird specials during slow months.",
      "Value-based pricing: Instead of charging by the hour, charge by the result. 'Garden cleanup: R500' vs 'R100/hr for 5 hours of garden work'. Both equal R500, but the first sounds like a solution while the second sounds like a cost. Customers pay more for solutions."
    ],
    actionSteps: ["Calculate your true hourly rate for your main service", "Do a break-even analysis for this month", "Identify your peak and off-peak seasons", "Convert one hourly service to a fixed-price package"],
    commonMistakes: ["Not factoring in unpaid time (travel, admin, quoting)", "Competing only on being the cheapest", "Never raising prices even as costs increase", "Not knowing your actual profit per job"]
  },
  {
    id: "12", title: "Tax Basics for Side Hustlers", description: "Stay legal and avoid surprises at tax time.", duration: "25 min", icon: <Shield className="h-6 w-6" />, difficulty: "Advanced", category: "finance",
    tips: ["Register as a provisional taxpayer if earning above threshold", "Keep receipts for all business expenses", "Understand which expenses are tax-deductible", "Set aside money monthly for tax payments", "Consider consulting a tax professional once you're established"],
    deepDive: [
      "SA tax basics for hustlers: If you earn more than R91,250/year (2024/25), you need to register as a taxpayer. If you earn side income, you're a provisional taxpayer and must file twice yearly. SARS is increasingly targeting informal earners — getting compliant now saves you penalties later.",
      "Tax-deductible expenses you're probably missing: Phone and data costs (business portion), transport/petrol for work, tools and equipment, marketing costs (Fuse Gigs boosts, flyers, data), home office expenses (if you work from home), protective clothing and uniforms. Keep ALL receipts!",
      "The monthly tax savings habit: Set aside 25% of your profit each month in a separate savings account labelled 'Tax'. When tax time comes, you'll have the money ready instead of scrambling. Many hustlers earn well but get hit with unexpected tax bills because they spent everything.",
      "When to get a tax professional: Once you're consistently earning R10,000+/month, a tax consultant (R500-R1500/year for a simple return) can save you thousands by finding deductions you missed. Ask other hustlers for recommendations — many accountants specialise in small businesses."
    ],
    actionSteps: ["Check if you need to register as a provisional taxpayer on SARS eFiling", "Start a 'Tax' savings account and transfer 25% of profits monthly", "Collect and organise all business receipts from this month", "Research tax consultants in your area who work with small businesses"],
    commonMistakes: ["Ignoring tax obligations until SARS contacts you", "Throwing away receipts for business expenses", "Not separating business and personal expenses for tax purposes", "Thinking you're too small to worry about tax"]
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
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> ~5 hours total</span>
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLessons.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:shadow-elevated ${expandedLesson === lesson.id ? "ring-2 ring-primary col-span-1 sm:col-span-2 lg:col-span-3" : ""}`}
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
                    <CardContent className="pt-0" onClick={(e) => e.stopPropagation()}>
                      <div className="border-t border-border pt-4 space-y-6">
                        {/* Key Takeaways */}
                        <div>
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

                        {/* Deep Dive */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-primary" /> Deep Dive
                          </h4>
                          <div className="space-y-3">
                            {lesson.deepDive.map((paragraph, i) => (
                              <p key={i} className="text-sm text-foreground/75 leading-relaxed">{paragraph}</p>
                            ))}
                          </div>
                        </div>

                        {/* Action Steps */}
                        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-primary" /> Action Steps — Do This Today
                          </h4>
                          <ul className="space-y-2">
                            {lesson.actionSteps.map((step, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Common Mistakes */}
                        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-1.5">
                            <Shield className="h-4 w-4 text-destructive" /> Common Mistakes to Avoid
                          </h4>
                          <ul className="space-y-2">
                            {lesson.commonMistakes.map((mistake, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                <span className="mt-0.5 text-destructive font-bold">✕</span>
                                {mistake}
                              </li>
                            ))}
                          </ul>
                        </div>
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
