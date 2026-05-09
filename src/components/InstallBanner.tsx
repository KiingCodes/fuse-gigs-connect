import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const InstallBanner = () => {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as any).standalone) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const timer = setTimeout(() => {
      if (!window.matchMedia("(display-mode: standalone)").matches) setShow(true);
    }, 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShow(false);
      setDeferredPrompt(null);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed bottom-4 left-1/2 z-[60] w-[min(94vw,440px)] -translate-x-1/2"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-background via-background to-accent/40 p-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            {/* shimmer accents */}
            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />

            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="relative flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-amber-500 blur-md opacity-60" />
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-amber-500 p-0.5 shadow-lg">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-background">
                    <img src={logo} alt="Fuse Gigs" className="h-10 w-10 object-contain" />
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-foreground text-sm truncate">Install Fuse Gigs</p>
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Add to home screen — faster, offline-ready & instant alerts.
                </p>
              </div>

              <Button
                onClick={handleInstall}
                size="sm"
                className="shrink-0 gradient-primary text-primary-foreground gap-1 font-semibold shadow-md"
              >
                <Download className="h-3.5 w-3.5" /> Install
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
