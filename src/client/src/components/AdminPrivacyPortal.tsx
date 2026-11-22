import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { User } from '../types.js';
import { fetchAdminPrivacyRecords, fetchAdminAuditLogs } from '../api.js';

interface AdminPrivacyPortalProps {
  user: User;
}

export const AdminPrivacyPortal: React.FC<AdminPrivacyPortalProps> = ({ user }) => {
  const [privacyRecords, setPrivacyRecords] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchAdminPrivacyRecords(), fetchAdminAuditLogs()])
      .then(([records, logs]) => {
        setPrivacyRecords(records);
        setAuditLogs(logs);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin privacy records:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white border border-stone-200 border-t-4 border-t-stone-900 rounded-3xl p-6 sm:p-8 shadow-studio">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-stone-100 text-stone-900 rounded-xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
              District Compliance & Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">COPPA & FERPA Compliance Center</h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
          EdPro complies with the Children’s Online Privacy Protection Act (COPPA) and Family Educational Rights and Privacy Act (FERPA). Zero advertising, zero third-party telemetry, minimal PII, and immutable access audit logs.
        </p>
      </div>

      {/* COPPA Student Privacy Consent Ledger */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-extrabold text-stone-900">Minor (Under 13) Parental & School Consent Ledger</h2>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Consent Status</th>
                <th className="py-3 px-4">Authorized By</th>
                <th className="py-3 px-4">Data Retention Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {privacyRecords.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-900">{r.display_name}</span>
                    <span className="text-[10px] text-stone-500 font-mono block">@{r.username}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{r.age} yrs</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {r.consent_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-600">
                    {r.authorized_by_name || 'School Principal / IT'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-500 text-[11px]">
                    {new Date(r.retention_expires_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable FERPA Audit Log */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-studio space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <FileText className="w-5 h-5 text-stone-800" />
          <h2 className="text-sm font-extrabold text-stone-900">Immutable FERPA Record Access Trail</h2>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Target Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/70">
                  <td className="py-2 px-4 text-stone-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-4 text-stone-900 font-medium">{log.actor_name || log.actor_id}</td>
                  <td className="py-2 px-4 text-stone-600">{log.actor_role}</td>
                  <td className="py-2 px-4 text-emerald-700 font-bold">{log.action}</td>
                  <td className="py-2 px-4 text-stone-500">{log.target_resource}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
