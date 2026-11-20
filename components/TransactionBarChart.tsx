"use client";

import { useSyncExternalStore, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupiah } from "@/lib/format";
import { formatRupiahRingkas, formatBucketLabel } from "@/lib/finance/chart-nav";
import { type ChartBucket, type ChartLevel } from "@/lib/finance/chart";

interface TransactionBarChartProps {
  level: ChartLevel;
  buckets: ChartBucket[];
  onBucketClick?: (bucket: ChartBucket) => void;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
    color?: string;
    name?: string;
  }>;
  label?: string;
}

const emptySubscribe = () => () => {};

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const incomeItem = payload.find((p) => p.dataKey === "income");
  const expenseItem = payload.find((p) => p.dataKey === "expense");

  const incomeVal = incomeItem?.value ?? 0;
  const expenseVal = expenseItem?.value ?? 0;

  return (
    <div className="rounded-xl bg-surface-elevated border border-line p-3 shadow-lg flex flex-col gap-1.5 text-xs">
      <span className="font-semibold text-text-main pb-1 border-b border-line">
        {label}
      </span>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-income)]" />
          <span className="text-text-secondary">Pemasukan</span>
        </div>
        <span className="font-medium text-income tabular-nums">
          +{formatRupiah(incomeVal)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[var(--color-expense)]" />
          <span className="text-text-secondary">Pengeluaran</span>
        </div>
        <span className="font-medium text-expense tabular-nums">
          −{formatRupiah(expenseVal)}
        </span>
      </div>
    </div>
  );
}

export function TransactionBarChart({
  level,
  buckets,
  onBucketClick,
  height = 260,
}: TransactionBarChartProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const chartData = buckets.map((b) => ({
    label: formatBucketLabel(b.from, b.to, level),
    from: b.from,
    to: b.to,
    income: b.income,
    expense: b.expense,
    bucket: b,
  }));

  // Handler klik pada BarChart: menerima state dengan activeTooltipIndex / activeIndex
  // mencakup seluruh kolom bucket bahkan saat nilai batang 0
  const handleChartClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => {
      if (!onBucketClick) return;
      const index = state?.activeTooltipIndex ?? state?.activeIndex;
      if (typeof index === "number" && index >= 0 && index < chartData.length) {
        onBucketClick(chartData[index].bucket);
      }
    },
    [onBucketClick, chartData]
  );

  // Fallback handler jika pengguna mengklik batang langsung
  const handleBarClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_data: any, index: number) => {
      if (!onBucketClick) return;
      if (typeof index === "number" && index >= 0 && index < chartData.length) {
        onBucketClick(chartData[index].bucket);
      }
    },
    [onBucketClick, chartData]
  );

  if (!isMounted) {
    return (
      <div style={{ height }} className="w-full flex items-center justify-center">
        <span className="text-text-secondary text-sm">Menyiapkan grafik...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Legenda Custom (dengan label jelas dan penanda warna, bukan hanya warna) */}
      <div className="flex items-center justify-end gap-5 text-xs text-text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[var(--color-income)]" />
          <span className="font-medium text-text-main">Pemasukan (+)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[var(--color-expense)]" />
          <span className="font-medium text-text-main">Pengeluaran (−)</span>
        </div>
      </div>

      {/* Kontainer Grafik Recharts */}
      <div
        style={{ height }}
        className={`w-full ${onBucketClick ? "cursor-pointer" : ""}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            onClick={handleChartClick}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--color-line)" }}
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--color-line)" }}
              tickFormatter={formatRupiahRingkas}
              width={55}
            />
            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{ fill: "var(--color-surface-elevated)", opacity: 0.5 }}
            />
            <Bar
              dataKey="income"
              name="Pemasukan"
              fill="var(--color-income)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              onClick={handleBarClick}
            />
            <Bar
              dataKey="expense"
              name="Pengeluaran"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
              onClick={handleBarClick}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Petunjuk interaksi klik jika onBucketClick aktif */}
      {onBucketClick && (
        <p className="text-[11px] text-text-muted text-center pt-1">
          Ketuk batang untuk melihat transaksinya
        </p>
      )}
    </div>
  );
}
