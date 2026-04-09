import { Shield } from "lucide-react";
import { useApprovedGuarantorCount } from "@/hooks/useGuarantors";
import { Badge } from "@/components/ui/badge";

interface Props {
  hustlerId: string;
  compact?: boolean;
}

const GuarantorBadge = ({ hustlerId, compact }: Props) => {
  const count = useApprovedGuarantorCount(hustlerId);

  if (count === 0) return null;

  if (compact) {
    return (
      <Badge variant="outline" className="gap-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
        <Shield className="h-3 w-3" /> {count}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30">
      <Shield className="h-3 w-3" /> Backed by {count} user{count !== 1 ? "s" : ""}
    </Badge>
  );
};

export default GuarantorBadge;
