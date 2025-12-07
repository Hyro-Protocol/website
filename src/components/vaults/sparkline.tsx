"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { VaultHistoricalSnapshot } from "@/lib/vaults/types";

interface SparklineProps {
  data: VaultHistoricalSnapshot[];
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  strokeWidth = 1.5,
}: SparklineProps) {
  const { path, fillPath, isPositive, gradientId } = useMemo(() => {
    if (data.length < 2) {
      return { path: "", fillPath: "", isPositive: true, gradientId: "" };
    }

    const values = data.map((d) => d.sharePrice);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = values.map((val, i) => {
      const x = padding + (i / (values.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
      return { x, y };
    });

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");

    // Create fill path (close the path at the bottom)
    const fillD = `${pathD} L ${points[points.length - 1].x.toFixed(2)} ${height} L ${padding} ${height} Z`;

    const firstVal = values[0];
    const lastVal = values[values.length - 1];
    const positive = lastVal >= firstVal;

    const id = `gradient-${firstVal.toPrecision(5)}-${lastVal.toPrecision(5)}`;

    return {
      path: pathD,
      fillPath: fillD,
      isPositive: positive,
      gradientId: id,
    };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div
        className={cn("flex items-center justify-center text-muted-foreground", className)}
        style={{ width, height }}
      >
        <span className="text-xs">No data</span>
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      
      {/* Fill area under the line */}
      <path
        d={fillPath}
        fill={`url(#${gradientId})`}
      />
      
      {/* Main line */}
      <path
        d={path}
        fill="none"
        stroke={isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

