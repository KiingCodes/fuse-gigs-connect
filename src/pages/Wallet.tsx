import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CURRENCIES = [
  { code: "ZAR", label: "South African Rand", symbol: "R", field: "balance_zar" },
  { code: "USD", label: "US Dollar", symbol: "$", field: "balance_usd" },
  { code: "NGN", label: "Nigerian Naira", symbol: "₦", field: "balance_ngn" },
  { code: "KES", label: "Kenyan Shilling", symbol: "KSh", field: "balance_kes" },
] as const;

const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  ZAR: { USD: 0.055, NGN: 85.5, KES: 7.1, ZAR: 1 },
  USD: { ZAR: 18.2, NGN: 1550, KES: 129, USD: 1 },
  NGN: { ZAR: 0.012, USD: 0.00065, KES: 0.083, NGN: 1 },
  KES: { ZAR: 0.14, USD: 0.0078, NGN: 12, KES: 1 },
};

const TX_ICONS: Record<string, React.ReactNode> = {
  deposit: <ArrowDownLeft className="h-4 w-4 text-emerald-500" />,
  withdrawal: <ArrowUpRight className="h-4 w-4 text-destructive" />,
  transfer_out: <ArrowUpRight className="h-4 w-4 text-orange-500" />,
  transfer_in: <ArrowDownLeft className="h-4 w-4 text-blue-500" />,
  conversion: <RefreshCw className="h-4 w-4 text-primary" />,
};

const Wallet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCurrency, setActiveCurrency] = useState("ZAR");

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: newWallet, error: createErr } = await supabase.from("wallets").insert({ user_id: user.id }).select().single();
        if (createErr) throw createErr;
        return newWallet;
      }
      return data;
    },
    enabled: !!user,
  });

  const { data: transactions } = useQuery({
    queryKey: ["wallet-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (!user) {
    navigate("/auth");
    return null;
  }

  const currentCurrency = CURRENCIES.find((c) => c.code === activeCurrency)!;
  const balance = wallet ? Number(wallet[currentCurrency.field as keyof typeof wallet] || 0) : 0;

  const filteredTxs = (transactions || []).filter((tx: any) => tx.currency === activeCurrency);

  const convertDisplay = (amount: number, from: string, to: string) => {
    const rate = EXCHANGE_RATES[from]?.[to] || 1;
    return (amount * rate).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Wallet" path="/wallet" />
      <Navbar />
      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
          <WalletIcon className="h-8 w-8 text-primary" /> Wallet
        </h1>

        {wallet?.is_frozen && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive font-medium">Your wallet has been frozen. Contact support for assistance.</p>
            </CardContent>
          </Card>
        )}

        {/* Currency Tabs */}
        <Tabs value={activeCurrency} onValueChange={setActiveCurrency}>
          <TabsList className="grid grid-cols-4">
            {CURRENCIES.map((c) => (
              <TabsTrigger key={c.code} value={c.code}>{c.code}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Balance Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="gradient-primary p-6">
              <p className="text-sm text-primary-foreground/70 mb-1">{currentCurrency.label}</p>
              <p className="text-4xl font-extrabold text-primary-foreground">
                {currentCurrency.symbol}{balance.toFixed(2)}
              </p>
              {activeCurrency !== "USD" && (
                <p className="text-sm text-primary-foreground/60 mt-1">
                  ≈ ${convertDisplay(balance, activeCurrency, "USD")} USD
                </p>
              )}
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2 text-center text-xs text-muted-foreground">
                {CURRENCIES.filter((c) => c.code !== activeCurrency).map((c) => (
                  <div key={c.code} className="rounded-lg bg-muted/50 p-2">
                    <p className="font-medium text-foreground">{c.symbol}{Number(wallet?.[c.field as keyof typeof wallet] || 0).toFixed(2)}</p>
                    <p>{c.code}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="flex flex-col gap-1 h-auto py-4" onClick={() => toast.info("Deposit feature coming soon! You'll be able to add funds via mobile money or bank transfer.")}>
            <ArrowDownLeft className="h-5 w-5 text-emerald-500" />
            <span className="text-xs">Deposit</span>
          </Button>
          <Button variant="outline" className="flex flex-col gap-1 h-auto py-4" onClick={() => toast.info("Withdrawal feature coming soon!")}>
            <ArrowUpRight className="h-5 w-5 text-primary" />
            <span className="text-xs">Withdraw</span>
          </Button>
          <Button variant="outline" className="flex flex-col gap-1 h-auto py-4" onClick={() => toast.info("Send money feature coming soon!")}>
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <span className="text-xs">Send</span>
          </Button>
        </div>

        {/* Exchange Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Exchange Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {CURRENCIES.filter((c) => c.code !== activeCurrency).map((c) => (
              <div key={c.code} className="flex justify-between text-sm">
                <span className="text-muted-foreground">1 {activeCurrency} →</span>
                <span className="font-medium text-foreground">{c.symbol}{EXCHANGE_RATES[activeCurrency]?.[c.code]?.toFixed(4) || "N/A"} {c.code}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTxs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {filteredTxs.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        {TX_ICONS[tx.type] || <RefreshCw className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{tx.type.replace("_", " ")}</p>
                        <p className="text-xs text-muted-foreground">{tx.description || format(new Date(tx.created_at), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.type.includes("in") || tx.type === "deposit" ? "text-emerald-500" : "text-foreground"}`}>
                        {tx.type.includes("in") || tx.type === "deposit" ? "+" : "-"}{currentCurrency.symbol}{Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <Badge variant={tx.status === "completed" ? "default" : tx.status === "failed" ? "destructive" : "secondary"} className="text-[9px]">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
