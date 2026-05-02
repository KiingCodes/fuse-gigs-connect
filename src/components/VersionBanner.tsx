import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVersionUpgradeBanner } from "@/hooks/useAppVersion";
import { motion, AnimatePresence } from "framer-motion";

const VersionBanner = () => {
  const { show, version, dismiss } = useVersionUpgradeBanner();

  if (!show || !version) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="sticky top-0 z-50 bg-gradient-to-r from-primary via-amber-500 to-orange-500 text-white"
      >
        <div className="container mx-auto flex items-center gap-3 px-4 py-2 text-sm">
          <Sparkles className="h-4 w-4 shrink-0" />
          <p className="flex-1 truncate">
            <span className="font-bold">v{version.version}</span> — {version.title}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs font-semibold"
            onClick={() => {
              dismiss();
              window.location.reload();
            }}
          >
            Reload
          </Button>
          <button onClick={dismiss} aria-label="Dismiss" className="rounded-full p-1 hover:bg-white/20">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VersionBanner;
