import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, DollarSign, Users, TrendingUp, ArrowRight, PlusCircle } from 'lucide-react';

export default function StakeholderDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.stakeholder().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">Organizer Dashboard</h1>
            <p className="page-subtitle">Manage your events and track performance</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/stakeholder/create-event')}>
            <PlusCircle size={16} /> Create Event
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Events', value: stats?.totalEvents ?? 0, icon: Calendar, color: '#6c63ff' },
              { label: 'Budget Allocated', value: `PKR ${(stats?.totalBudgetAllocated ?? 0).toLocaleString()}`, icon: DollarSign, color: '#f59e0b' },
              { label: 'Total Disbursed', value: `PKR ${(stats?.totalDisbursed ?? 0).toLocaleString()}`, icon: TrendingUp, color: '#22c55e' },
              { label: 'Active Events', value: stats?.statusBreakdown?.OPEN ?? 0, icon: Users, color: '#06b6d4' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: color + '20', color, marginBottom: 12 }}><Icon size={20} /></div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Events table */}
          <div className="card">
            <div className="header-row" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>My Events</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/stakeholder/events')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            {stats?.events?.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Event</th><th>Date</th><th>Fill Rate</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.events.slice(0, 5).map(e => (
                      <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/stakeholder/events')}>
                        <td style={{ fontWeight: 600 }}>{e.title}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(e.date).toLocaleDateString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: e.fillRate, background: 'var(--accent)', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{e.registered}/{e.required}</span>
                          </div>
                        </td>
                        <td><span className={`badge badge-${e.status.toLowerCase()}`}>{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <Calendar size={36} color="var(--text-muted)" />
                <h3>No events yet</h3>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/stakeholder/create-event')}>
                  Create your first event
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
