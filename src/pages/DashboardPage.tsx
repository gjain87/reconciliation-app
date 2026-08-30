import React, { useEffect, useState } from 'react';
import { reconciliationApi } from '../api/client';
import { type ReconciliationSummary,type Discrepancy } from '../types';
import { HeadlineMetrics } from '../components/HeadlineMetrics';
import { DiscrepancyCharts } from '../components/DiscrepancyCharts';
import { DiscrepancyTable } from '../components/DiscrepancyTable';
import { Loader2, RefreshCw, AlertCircle, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<{ executiveSummary: string; topRisks: string[] } | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, discRes] = await Promise.all([
        reconciliationApi.getSummary(),
        reconciliationApi.getDiscrepancies(),
      ]);
      setSummary(sumRes.data);
      setDiscrepancies(discRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reconciliation metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateExecutiveReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await reconciliationApi.explainAll();
      setAiReport(res.data);
    } catch (err: any) {
      alert('Failed to generate AI executive summary.');
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="text-slate-500 font-medium">Loading reconciliation state...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">No Reconciled Data Found</h3>
        <p className="text-sm text-slate-500">
          Upload orders.csv and payments.csv datasets to begin reconciling.
        </p>
        <Link
          to="/upload"
          className="inline-block px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
        >
          Go to Ingestion
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Reconciliation Overview</h1>
          <p className="text-sm text-slate-500">
            Real-time discrepancies between store orders and payment processor settlements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleGenerateExecutiveReport}
            disabled={generatingReport}
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
          >
            {generatingReport ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bot className="h-4 w-4" />
            )}
            <span>AI Executive Brief</span>
          </button>

          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* AI Executive Summary Card */}
      {aiReport && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 via-white to-slate-50 border border-indigo-200 rounded-xl space-y-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-indigo-600" />
            <h3 className="font-bold text-indigo-950">AI Executive Revenue Brief</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{aiReport.executiveSummary}</p>
          {aiReport.topRisks?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-indigo-900 uppercase mb-1">Key Actionable Risks:</h4>
              <ul className="list-disc pl-5 text-xs text-slate-600 space-y-0.5">
                {aiReport.topRisks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 1. Headline Numbers */}
      <HeadlineMetrics summary={summary} />

      {/* 2. Charts */}
      <DiscrepancyCharts summary={summary} />

      {/* 3. Filterable Table */}
      <DiscrepancyTable discrepancies={discrepancies} />
    </div>
  );
};