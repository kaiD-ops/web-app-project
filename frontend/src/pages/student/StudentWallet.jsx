import { useEffect, useState } from 'react';
import { statsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Wallet, TrendingUp, CheckCircle } from 'lucide-react';

export default function StudentWallet() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsAPI.student().then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const paidGigs = stats?.statusBreakdown?.PAID ?? 0;
  const totalEarned = stats?.overview?.totalEarned ?? 0;
  const walletBalance = stats?.overview?.walletBalance ?? 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Wallet</h1>
        <p className="page-subtitle">Your earnings and balance</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : (
        <>
          {/* Balance card */}
          <div style={{ background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)', borderRadius: 'var(--radius-lg)', padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              <Wallet size={16} /> Wallet Balance
            </div>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
              PKR {walletBalance.toLocaleString()}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 8 }}>Available for withdrawal</p>
          </div>

          <div className="grid-3" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Earned', value: `PKR ${totalEarned.toLocaleString()}`, icon: TrendingUp, color: '#22c55e' },
              { label: 'Paid Events', value: paidGigs, icon: CheckCircle, color: '#6c63ff' },
              { label: 'Avg per Gig', value: paidGigs > 0 ? `PKR ${Math.round(totalEarned / paidGigs).toLocaleString()}` : '—', icon: Wallet, color: '#f59e0b' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="stat-card">
                <div className="stat-icon" style={{ background: color + '20', color, marginBottom: 12 }}><Icon size={20} /></div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {/* Gig breakdown */}
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Gig Status Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(stats?.statusBreakdown ?? {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>
                  <span style={{ fontWeight: 700 }}>{count} gig{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
              {Object.keys(stats?.statusBreakdown ?? {}).length === 0 && (
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No gig history yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
