"use client";

import { TrendingUp, Target, Award, XCircle, BarChart3 } from "lucide-react";

interface DashboardMetricsProps {
  totalValue: number;
  totalCount: number;
  hotCount: number;
  hotWinCount: number;
  hotWinPct: number | null;
  winCount: number;
  loseCount: number;
}

export function DashboardMetrics({
  totalValue,
  totalCount,
  hotCount,
  hotWinCount,
  hotWinPct,
  winCount,
  loseCount,
}: DashboardMetricsProps) {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="card flex items-start gap-4 p-5">
        <div className="rounded-lg bg-cyan-100 p-2.5 text-cyan-700">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Value</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{formatCurrency(totalValue)}</p>
          <p className="mt-0.5 text-xs text-slate-500">berdasarkan filter</p>
        </div>
      </div>
      <div className="card flex items-start gap-4 p-5">
        <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Projects</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">{totalCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">proyek terfilter</p>
        </div>
      </div>
      <div className="card flex items-start gap-4 p-5">
        <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Hot Lead → Win</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            {hotWinPct != null ? `${hotWinPct}%` : "—"}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {hotWinCount} / {hotCount} Hot Prospect
          </p>
        </div>
      </div>
      <div className="card flex items-start gap-4 p-5">
        <div className="flex gap-2">
          <div className="rounded-lg bg-green-100 p-2.5 text-green-700">
            <Award className="h-5 w-5" />
          </div>
          <div className="rounded-lg bg-red-100 p-2.5 text-red-600">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Win / Lose</p>
          <p className="mt-1 text-lg font-semibold text-slate-800">
            <span className="text-green-700">{winCount}</span>
            <span className="mx-1 text-slate-400">/</span>
            <span className="text-red-600">{loseCount}</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500">proyek</p>
        </div>
      </div>
    </div>
  );
}
