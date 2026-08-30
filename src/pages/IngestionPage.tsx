import React, { useState } from 'react';
import { reconciliationApi } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const IngestionPage: React.FC = () => {
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [paymentsFile, setPaymentsFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordersFile || !paymentsFile) {
      setError('Please provide both orders.csv and payments.csv datasets.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('orders', ordersFile);
    formData.append('payments', paymentsFile);

    try {
      await reconciliationApi.uploadFiles(formData);
      setSuccess('Datasets uploaded and reconciled successfully!');
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ingestion failed. Please check CSV format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dataset Ingestion</h1>
        <p className="text-sm text-slate-500">
          Upload your order export and payment processing statement to run deterministic reconciliation.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center space-x-2 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Orders Dataset (`orders.csv`)</label>
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer relative bg-slate-50">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setOrdersFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileText className="h-8 w-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700">
              {ordersFile ? ordersFile.name : 'Click or drop orders.csv here'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Payments Dataset (`payments.csv`)</label>
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer relative bg-slate-50">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setPaymentsFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileText className="h-8 w-8 text-slate-400 mb-2" />
            <span className="text-sm font-medium text-slate-700">
              {paymentsFile ? paymentsFile.name : 'Click or drop payments.csv here'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !ordersFile || !paymentsFile}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Reconciliation...</span>
            </>
          ) : (
            <>
              <UploadCloud className="h-5 w-5" />
              <span>Run Reconciliation Engine</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};