import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const LEVELS = [
  { label: "Unverified", icon: Shield, color: "text-muted-foreground", bg: "bg-muted" },
  { label: "Phone Verified", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "ID Verified", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Business Verified", icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const VerificationBadge = ({ level, size = "sm", showLabel = false }: VerificationBadgeProps) => {
  const config = LEVELS[Math.min(level, 3)];
  const Icon = config.icon;
  const iconSize = size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";

  if (level === 0 && !showLabel) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`gap-1 border-0 ${config.bg} ${config.color} text-xs font-medium`}>
          <Icon className={iconSize} />
          {showLabel && <span>{config.label}</span>}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p>{config.label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default VerificationBadge;
