import { useEffect, useState } from 'react';
import { registrationsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, MapPin, Clock, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const statusOrder = { REGISTERED: 0, ATTENDED: 1, PAID: 2, ABSENT: 3 };

export default function MyGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => {
    registrationsAPI.myGigs()
      .then(r => setGigs(r.data.data))
      .catch(() => toast.error('Failed to load gigs'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (eventId) => {
    if (!confirm('Cancel this registration?')) return;
    setCancelling(eventId);
    try {
      await registrationsAPI.cancel(eventId);
      toast.success('Registration cancelled');
      setGigs(g => g.filter(x => x.eventId !== eventId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    } finally {
      setCancelling(null);
    }
  };

  const now = new Date();
  const upcoming = gigs.filter(g => g.status === 'REGISTERED' && new Date(g.event.date) > now);
  const past = gigs.filter(g => g.status !== 'REGISTERED' || new Date(g.event.date) <= now);
  const displayed = tab === 'upcoming' ? upcoming : past;

  const statusBadge = (status) => {
    const map = { REGISTERED: 'badge-registered', ATTENDED: 'badge-attended', PAID: 'badge-paid', ABSENT: 'badge-absent' };
    return <span className={`badge ${map[status] || 'badge-registered'}`}>{status}</span>;
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">My Gigs</h1>
        <p className="page-subtitle">Track your registered and completed events</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 'var(--radius-sm)', width: 'fit-content', marginBottom: 24 }}>
        {[{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'history', label: `History (${past.length})` }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 20px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, transition: 'all 0.15s', background: tab === t.id ? 'var(--bg-card)' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : displayed.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} color="var(--text-muted)" />
          <h3>{tab === 'upcoming' ? 'No upcoming gigs' : 'No past gigs'}</h3>
          <p>{tab === 'upcoming' ? 'Browse events and confirm your availability' : 'Completed events will appear here'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {displayed.map(gig => (
            <div key={gig.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>{gig.event.title}</h3>
                  {statusBadge(gig.status)}
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[
                    { icon: Calendar, text: new Date(gig.event.date).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) },
                    { icon: MapPin, text: gig.event.venue },
                    { icon: Clock, text: `${gig.event.duration} mins` },
                  ].map(({ icon: Icon, text }) => (
                    <span key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Icon size={12} />{text}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: gig.status === 'PAID' ? 'var(--success)' : gig.status === 'ABSENT' ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {gig.status === 'ABSENT' ? '—' : `PKR ${gig.event.payoutPerStudent}`}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>payout</div>
                </div>
                {gig.status === 'REGISTERED' && new Date(gig.event.date) > now && (
                  <button className="btn btn-danger btn-sm" disabled={cancelling === gig.eventId} onClick={() => handleCancel(gig.eventId)}>
                    {cancelling === gig.eventId ? <span className="spinner" /> : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
