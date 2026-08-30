import React, { useState } from 'react';
import { type Discrepancy } from '../types';
import { reconciliationApi } from '../api/client';
import { Sparkles, Search, Loader2, X, AlertCircle } from 'lucide-react';

interface DiscrepancyTableProps {
  discrepancies: Discrepancy[];
}

export const DiscrepancyTable: React.FC<DiscrepancyTableProps> = ({ discrepancies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');

  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [modalData, setModalData] = useState<{
    item: Discrepancy;
    explanation?: string;
    action?: string;
  } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const filtered = discrepancies.filter((d) => {
    const matchesSearch =
      (d.orderId && d.orderId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.transactionRef && d.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (d.customerEmail && d.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || d.discrepancyType === selectedType;
    const matchesSeverity = selectedSeverity === 'ALL' || d.severity === selectedSeverity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const handleExplain = async (item: Discrepancy) => {
    setModalData({ item });
    setModalLoading(true);
    setModalError(null);
    setExplainingId(item.id);

    try {
      const res = await reconciliationApi.explainDiscrepancy(item.id);
      setModalData({
        item,
        explanation: res.data.explanation,
        action: res.data.recommendedAction,
      });
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to fetch AI root cause explanation.');
    } finally {
      setModalLoading(false);
      setExplainingId(null);
    }
  };

  const formatCurrency = (val?: number) =>
    val !== undefined
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
      : '—';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-900">Discrepancy Drill-Down</h3>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Order, Txn, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Discrepancy Types</option>
            <option value="MISSING_PAYMENT">Missing Payment</option>
            <option value="ORPHAN_PAYMENT">Orphan Payment</option>
            <option value="AMOUNT_MISMATCH">Amount Mismatch</option>
            <option value="DUPLICATE_PAYMENT">Duplicate Charge</option>
            <option value="STATUS_MISMATCH">Status Mismatch</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Txn Ref</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4 text-right">Order Net</th>
              <th className="py-3 px-4 text-right">Paid Net</th>
              <th className="py-3 px-4 text-right">Variance</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No discrepancies found for selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-800">
                    {item.orderId || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.transactionRef || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                    {(item.discrepancyType ?? 'UNKNOWN').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        item.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : item.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(item.orderAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(item.paymentAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-rose-600">
                    {formatCurrency(item.difference)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleExplain(item)}
                      disabled={explainingId === item.id}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{explainingId === item.id ? 'Analyzing...' : 'Explain'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* AI Explanation Slide-over / Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h4 className="text-base font-bold text-slate-900">
                  AI Discrepancy Diagnosis
                </h4>
              </div>
              <button
                onClick={() => setModalData(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono">
              <p>
                <span className="text-slate-400">Order ID:</span>{' '}
                {modalData.item.orderId || 'N/A'}
              </p>
              <p>
                <span className="text-slate-400">Transaction Ref:</span>{' '}
                {modalData.item.transactionRef || 'N/A'}
              </p>
              <p>
                <span className="text-slate-400">Type:</span>{' '}
                {modalData.item.discrepancyType}
              </p>
            </div>

            {modalLoading && (
              <div className="py-8 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">
                  Querying backend LLM for financial reconciliation analysis...
                </p>
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {!modalLoading && !modalError && modalData.explanation && (
              <div className="space-y-4 text-sm">
                <div>
                  <h5 className="font-semibold text-slate-800 mb-1">What Likely Happened:</h5>
                  <p className="text-slate-600 leading-relaxed bg-indigo-50/50 p-3 rounded-md border border-indigo-100">
                    {modalData.explanation}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold text-slate-800 mb-1">Recommended Action:</h5>
                  <p className="text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-md border border-emerald-100">
                    {modalData.action}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};