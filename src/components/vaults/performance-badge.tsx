"use client";

import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

interface PerformanceBadgeProps {
  value: number | null;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PerformanceBadge({
  value,
  className,
  showIcon = false,
  size = "md",
}: PerformanceBadgeProps) {
  if (value === null || value === undefined) {
    return (
      <span className={cn("text-muted-foreground", className)}>
        —
      </span>
    );
  }

  const isPositive = value > 0;
  const isNeutral = Math.abs(value) < 0.01;

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base font-medium",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono tabular-nums",
        sizeClasses[size],
        isNeutral
          ? "text-muted-foreground"
          : isPositive
          ? "text-green-500"
          : "text-red-500",
        className
      )}
    >
      {showIcon && (
        isNeutral ? (
          <Minus className={iconSizes[size]} />
        ) : isPositive ? (
          <TrendingUp className={iconSizes[size]} />
        ) : (
          <TrendingDown className={iconSizes[size]} />
        )
      )}
      {isPositive && "+"}
      {value.toFixed(2)}%
    </span>
  );
}

