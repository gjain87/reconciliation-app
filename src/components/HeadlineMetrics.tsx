import React from 'react';
import { type ReconciliationSummary } from '../types';
import { ShoppingCart, CreditCard, CheckCircle2, AlertTriangle, Flame } from 'lucide-react';
import { formatCurrency, parseBigDecimal } from '../utils/currency';

export const HeadlineMetrics: React.FC<{ summary: ReconciliationSummary | any }> = ({ summary }) => {
  // Normalize payload if backend wraps inside { data: ... }
  const data = summary?.data ? summary.data : summary || {};

  // Extract count fields (integer / long / string)
  const totalOrders = parseBigDecimal(
    data.totalOrders ?? data.total_orders ?? data.orderCount ?? 0
  );
  
  const totalPayments = parseBigDecimal(
    data.totalPayments ?? data.total_payments ?? data.paymentCount ?? 0
  );

  const reconciledCount = parseBigDecimal(
    data.reconciledCount ?? data.reconciled_count ?? 0
  );

  const discrepancyCount = parseBigDecimal(
    data.discrepancyCount ?? data.discrepancy_count ?? 0
  );

  // Extract monetary BigDecimal fields
  const reconciledAmount =
    data.totalReconciledAmount ??
    data.total_reconciled_amount ??
    data.reconciledAmount ??
    0;

  const disputeAmount =
    data.totalDisputeAmount ??
    data.total_dispute_amount ??
    data.disputeAmount ??
    0;

  const amountAtRisk =
    data.totalAmountAtRisk ??
    data.total_amount_at_risk ??
    data.amountAtRisk ??
    0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Orders */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
          <ShoppingCart className="h-5 w-5 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
        <span className="text-xs text-slate-400">Exported from store</span>
      </div>

      {/* Total Payments */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payments</span>
          <CreditCard className="h-5 w-5 text-indigo-500" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{totalPayments}</p>
        <span className="text-xs text-slate-400">Processor records</span>
      </div>

      {/* Reconciled Value */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reconciled Value</span>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-2xl font-bold text-emerald-600">
          {formatCurrency(reconciledAmount)}
        </p>
        <span className="text-xs text-emerald-600 font-medium">
          {reconciledCount} matches
        </span>
      </div>

      {/* Disputed Value */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disputed Value</span>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-amber-600">
          {formatCurrency(disputeAmount)}
        </p>
        <span className="text-xs text-amber-600 font-medium">
          {discrepancyCount} items
        </span>
      </div>

      {/* Money At Risk */}
      <div className="bg-rose-50 p-5 rounded-xl border border-rose-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Money At Risk</span>
          <Flame className="h-5 w-5 text-rose-600" />
        </div>
        <p className="text-2xl font-bold text-rose-700">
          {formatCurrency(amountAtRisk)}
        </p>
        <span className="text-xs text-rose-600 font-medium">Requires immediate action</span>
      </div>
    </div>
  );
};