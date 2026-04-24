import { useEffect, useState } from 'react';
import { statsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Calendar, DollarSign, TrendingUp, CheckSquare } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.admin().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Platform Overview</h1>
        <p className="page-subtitle">CrowdCoin admin dashboard</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Users', value: stats?.overview?.totalUsers ?? 0, icon: Users, color: '#6c63ff' },
              { label: 'Total Events', value: stats?.overview?.totalEvents ?? 0, icon: Calendar, color: '#06b6d4' },
              { label: 'Registrations', value: stats?.overview?.totalRegistrations ?? 0, icon: CheckSquare, color: '#f59e0b' },
              { label: 'Total Disbursed', value: `PKR ${(stats?.overview?.totalAmountDisbursed ?? 0).toLocaleString()}`, icon: DollarSign, color: '#22c55e' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: color + '20', color, marginBottom: 12 }}><Icon size={20} /></div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Users by Role</h2>
              {Object.entries(stats?.userBreakdown ?? {}).map(([role, count]) => {
                const colors = { STUDENT: '#22c55e', STAKEHOLDER: '#6c63ff', ADMIN: '#f59e0b' };
                const total = Object.values(stats.userBreakdown).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={role} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{role}</span>
                      <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: colors[role] || 'var(--accent)', borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Events by Status</h2>
              {Object.entries(stats?.eventBreakdown ?? {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count}</span>
                </div>
              ))}
              {Object.keys(stats?.eventBreakdown ?? {}).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>No events yet</p>
              )}
            </div>
          </div>

          {/* Recent events */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Events</h2>
            {stats?.recentEvents?.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Event</th><th>Organizer</th><th>Date</th><th>Registrations</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentEvents.map(e => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 600 }}>{e.title}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{e.stakeholder?.name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(e.date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>{e._count?.registrations ?? 0}</td>
                        <td><span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No events yet</p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
