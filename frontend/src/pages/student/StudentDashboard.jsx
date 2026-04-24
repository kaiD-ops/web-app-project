import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { statsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Briefcase, Wallet, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.student().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's your gig overview</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : (
        <>
          <div className="grid-4" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Gigs', value: stats?.overview?.totalGigs ?? 0, icon: Briefcase, color: '#6c63ff' },
              { label: 'Total Earned', value: `PKR ${(stats?.overview?.totalEarned ?? 0).toLocaleString()}`, icon: TrendingUp, color: '#22c55e' },
              { label: 'Wallet Balance', value: `PKR ${(stats?.overview?.walletBalance ?? 0).toLocaleString()}`, icon: Wallet, color: '#f59e0b' },
              { label: 'Upcoming Gigs', value: stats?.overview?.upcomingGigs ?? 0, icon: Calendar, color: '#06b6d4' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="stat-icon" style={{ background: color + '20', color }}><Icon size={20} /></div>
                </div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Upcoming gigs */}
          <div className="card">
            <div className="header-row" style={{ marginBottom: 20 }}>
              <div><h2 style={{ fontSize: 18, fontWeight: 700 }}>Upcoming Gigs</h2></div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/student/my-gigs')}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            {stats?.upcomingGigs?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stats.upcomingGigs.slice(0, 4).map(gig => (
                  <div key={gig.eventId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 14 }}>{gig.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {new Date(gig.date).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>PKR {gig.payout}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '32px 20px' }}>
                <Calendar size={36} color="var(--text-muted)" />
                <h3>No upcoming gigs</h3>
                <p>Browse events and confirm your availability</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/student/events')}>
                  Browse Events
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
