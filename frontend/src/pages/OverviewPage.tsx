import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { DashboardStats, AuditLog } from '../types';
import {
  Users,
  UserCheck,
  Link2,
  AlertCircle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, auditRes] = await Promise.all([
          api.dashboard.stats(),
          api.audit.list({ page_size: 6 }),
        ]);

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (auditRes.success) {
          const logs = (auditRes.data as any).results || auditRes.data || [];
          setRecentLogs(Array.isArray(logs) ? logs.slice(0, 6) : []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-sm text-slate-500 font-medium">Aggregating clinical intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = stats?.kpis || {
    total_patients: 0,
    total_doctors: 0,
    active_mappings: 0,
    unassigned_patients: 0,
  };

  const maxMonthCount = Math.max(
    ...(stats?.monthly_trend.map((m) => m.count) || [1]),
    1
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Clinical Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry, provider assignments, and HIPAA audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/patients"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span>View Patients</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/mappings"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition-all"
          >
            <span>Assign Doctor</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Patients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis.total_patients}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Owner-Scoped
            </span>
          </div>
        </div>

        {/* Doctors in Catalog */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Medical Doctors
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis.total_doctors}
            </span>
            <span className="text-xs font-medium text-slate-400">Catalog-wide</span>
          </div>
        </div>

        {/* Active Mappings */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Assignments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Link2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis.active_mappings}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              Care Teams
            </span>
          </div>
        </div>

        {/* Unassigned Patients */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Unassigned Patients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {kpis.unassigned_patients}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Needs Doctor
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Intake Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Patient Registrations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Intake volume recorded over the past 6 calendar months
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">
              <Activity className="h-3.5 w-3.5" />
              <span>Real-time ORM</span>
            </div>
          </div>

          <div className="pt-6 pb-2">
            {stats?.monthly_trend && stats.monthly_trend.length > 0 ? (
              <div className="flex items-end gap-3 sm:gap-6 h-48 w-full border-b border-slate-200 dark:border-slate-800 pb-2">
                {stats.monthly_trend.map((item, idx) => {
                  const heightPercent = Math.max(12, Math.round((item.count / maxMonthCount) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[11px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end h-40">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-teal-600 to-teal-400 group-hover:from-teal-500 group-hover:to-teal-300 transition-all rounded-t-lg"
                        />
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 truncate max-w-[60px]">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
                No monthly data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Doctor Specialization Breakdown */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Specialties Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Top clinical faculties in catalog</p>
          </div>

          <div className="space-y-3.5 my-6">
            {stats?.top_specializations && stats.top_specializations.length > 0 ? (
              stats.top_specializations.slice(0, 5).map((spec, i) => {
                const total = kpis.total_doctors || 1;
                const pct = Math.round((spec.count / total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{spec.specialization}</span>
                      <span className="text-slate-400">{spec.count} docs ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-teal-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400">No specialties registered yet.</div>
            )}
          </div>

          <Link
            to="/doctors"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Explore all doctors</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Recent HIPAA Audit Feed */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Activity & Audit Trail
            </h3>
          </div>
          <Link
            to="/audit"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            Full Trail
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="pb-3">Action</th>
                <th className="pb-3">Resource</th>
                <th className="pb-3">Initiated By</th>
                <th className="pb-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-semibold">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : log.action === 'DELETE'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                    {log.resource_type} #{log.resource_id}
                  </td>
                  <td className="py-3 text-slate-500">{log.user_email}</td>
                  <td className="py-3 text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
