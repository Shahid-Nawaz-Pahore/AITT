import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import { shortHash } from "../../mock/utils";

/** Shows that an action was "anchored on-chain" with a (simulated) tx hash. */
export function OnChainBadge({
  txHash,
  label = "Anchored",
  className,
}: {
  txHash?: string;
  label?: string;
  className?: string;
}) {
  if (!txHash) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-dashed px-2 py-0.5 text-xs text-muted-foreground",
          className,
        )}
      >
        Not anchored
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary",
        className,
      )}
      title={txHash}
    >
      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
      <span className="font-medium">{label} ✓</span>
      <span className="font-mono break-all">{shortHash(txHash)}</span>
    </span>
  );
}
