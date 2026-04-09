import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { ScamCheckResult } from "@/hooks/useScamDetector";

interface Props {
  result: ScamCheckResult;
  onDismiss?: () => void;
}

const ScamWarningBanner = ({ result, onDismiss }: Props) => {
  const [dismissed, setDismissed] = useState(false);

  if (!result.isSuspicious || dismissed) return null;

  const bgColor = result.confidence === "high"
    ? "bg-destructive/10 border-destructive/30"
    : result.confidence === "medium"
    ? "bg-[hsl(35,92%,50%)]/10 border-[hsl(35,92%,50%)]/30"
    : "bg-[hsl(45,93%,47%)]/10 border-[hsl(45,93%,47%)]/30";

  const iconColor = result.confidence === "high"
    ? "text-destructive"
    : "text-[hsl(35,92%,50%)]";

  return (
    <div className={`rounded-xl border p-4 ${bgColor} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${iconColor}`}>
            {result.confidence === "high" ? "⚠️ High Risk Detected" : result.confidence === "medium" ? "⚠️ Suspicious Activity" : "⚠️ Caution Advised"}
          </p>
          <ul className="mt-1 space-y-0.5">
            {result.warnings.map((w, i) => (
              <li key={i} className="text-xs text-foreground/70">• {w}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => { setDismissed(true); onDismiss?.(); }}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ScamWarningBanner;
