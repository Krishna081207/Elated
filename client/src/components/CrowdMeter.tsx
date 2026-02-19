import { cn } from "@/lib/utils";
import { Users, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

type CrowdLevel = "quiet" | "moderate" | "busy" | "packed";

interface CrowdMeterProps {
  currentLevel: CrowdLevel;
  predictedNext?: CrowdLevel;
  explanation?: string;
  className?: string;
  compact?: boolean;
}

const levelConfig = {
  quiet: { color: "bg-emerald-500", text: "text-emerald-700", label: "Quiet", percent: 25 },
  moderate: { color: "bg-amber-400", text: "text-amber-700", label: "Moderate", percent: 50 },
  busy: { color: "bg-orange-500", text: "text-orange-700", label: "Busy", percent: 75 },
  packed: { color: "bg-red-500", text: "text-red-700", label: "Packed", percent: 95 },
};

export function CrowdMeter({ currentLevel, predictedNext, explanation, className, compact }: CrowdMeterProps) {
  const config = levelConfig[currentLevel];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-2.5 w-16 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-500", config.color)} 
            style={{ width: `${config.percent}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium", config.text)}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-card border rounded-2xl p-5 shadow-sm", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg bg-secondary", config.text)}>
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg leading-none">Crowd Meter</h3>
          <span className="text-xs text-muted-foreground">Live AI Prediction</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className={cn("text-2xl font-bold", config.text)}>{config.label}</span>
            <span className="text-sm text-muted-foreground">~{config.percent}% Full</span>
          </div>
          <div className="h-4 bg-muted/50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${config.percent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={cn("h-full rounded-full relative overflow-hidden", config.color)}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
            </motion.div>
          </div>
        </div>

        {explanation && (
          <p className="text-sm text-muted-foreground italic border-l-2 border-primary/20 pl-3">
            "{explanation}"
          </p>
        )}

        {predictedNext && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t text-sm">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              Trend: <span className="font-medium text-foreground">{levelConfig[predictedNext].label}</span> in 1h
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
