import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { AuditLog } from '../types';
import { Shield, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Modal } from '../components/Modal';

export const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (actionFilter) params.action = actionFilter;

      const res = await api.audit.list(params);
      if (res.success && res.data) {
        if ('results' in res.data) {
          setLogs(res.data.results);
          setTotalCount(res.data.count);
        } else if (Array.isArray(res.data)) {
          setLogs(res.data);
          setTotalCount(res.data.length);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-[#EEF2FC] text-[#3B4EF8] border-[#DCE4FB]';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'LOGIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1E2438] flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#3B4EF8]" />
            <span>Clinical System Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable HIPAA-aligned event logging. All records, logins, updates, and deletes are captured.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-full border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 focus:border-[#3B4EF8] focus:outline-none cursor-pointer"
          >
            <option value="">All Event Types</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[28px] border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F6F8FB] border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-5">Event</th>
                <th className="py-3.5 px-5">Resource Target</th>
                <th className="py-3.5 px-5">Initiated By</th>
                <th className="py-3.5 px-5">IP Address</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B4EF8] border-t-transparent"></div>
                      <span>Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit logs recorded for this criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFC] transition-colors">
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#1E2438]">{log.resource_type}</div>
                      <div className="text-[11px] text-slate-400">Target ID: {log.resource_id}</div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 font-semibold">
                      {log.user_email || 'System Admin'}
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono text-slate-500">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-500 font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="rounded-full p-1.5 text-slate-400 hover:bg-[#EEF2FC] hover:text-[#3B4EF8] transition-colors cursor-pointer"
                        title="View Change Snapshot"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-xs text-slate-500 bg-white">
          <div>
            Showing <span className="font-bold text-[#1E2438]">{logs.length}</span> of{' '}
            <span className="font-bold text-[#1E2438]">{totalCount}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 hover:bg-[#F6F8FB] font-semibold text-slate-600 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <span className="font-bold text-[#1E2438] px-2">Page {page}</span>
            <button
              disabled={logs.length < 10}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 hover:bg-[#F6F8FB] font-semibold text-slate-600 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Snapshot"
        description={`Event ID #${selectedLog?.id} • ${selectedLog?.action} on ${selectedLog?.resource_type} #${selectedLog?.resource_id}`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-[#F6F8FB] p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Operator</span>
                <span className="font-bold text-[#1E2438]">{selectedLog.user_email || 'System'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Client IP</span>
                <span className="font-bold text-[#1E2438]">{selectedLog.ip_address || 'Internal/CLI'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                JSON Diff Payload
              </span>
              <pre className="max-h-64 overflow-auto rounded-2xl bg-[#F6F8FB] p-4 font-mono text-[11px] text-slate-800 border border-slate-100">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
