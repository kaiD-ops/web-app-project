import { useEffect, useState } from 'react';
import { eventsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, CheckCircle, XCircle, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [acting, setActing] = useState(null);

  useEffect(() => {
    eventsAPI.getAll().then(r => setEvents(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setActing(id + '_approve');
    try {
      await eventsAPI.approve(id);
      toast.success('Event approved and now live!');
      setEvents(ev => ev.map(e => e.id === id ? { ...e, status: 'OPEN' } : e));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(null); }
  };

  const handleClose = async (id) => {
    if (!confirm('Close this event for attendance verification?')) return;
    setActing(id + '_close');
    try {
      await eventsAPI.close(id);
      toast.success('Event closed. Ready for attendance marking.');
      setEvents(ev => ev.map(e => e.id === id ? { ...e, status: 'AWAITING_VERIFICATION' } : e));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setActing(null); }
  };

  const statuses = ['ALL', 'PENDING', 'OPEN', 'AWAITING_VERIFICATION', 'COMPLETED', 'CANCELLED'];
  const filtered = events.filter(e => {
    const matchFilter = filter === 'ALL' || e.status === filter;
    const matchSearch = !search.trim() || e.title.toLowerCase().includes(search.toLowerCase()) || e.stakeholder?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">All Events</h1>
            <p className="page-subtitle">{filtered.length} events</p>
          </div>
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>}
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 99, border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`, background: filter === s ? 'var(--accent-light)' : 'transparent', color: filter === s ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="var(--text-muted)" />
          <h3>No events found</h3>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Event</th><th>Organizer</th><th>Date</th><th>Students</th><th>Budget</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(event => (
                <tr key={event.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{event.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{event.venue}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{event.stakeholder?.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(event.date).toLocaleDateString()}</td>
                  <td style={{ fontSize: 13 }}>{event._count?.registrations ?? 0} / {event.requiredStudents}</td>
                  <td style={{ fontSize: 13 }}>PKR {event.totalBudget?.toLocaleString()}</td>
                  <td><span className={`badge badge-${event.status.toLowerCase()}`}>{event.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {event.status === 'PENDING' && (
                        <button className="btn btn-success btn-sm" disabled={acting === event.id + '_approve'} onClick={() => handleApprove(event.id)}>
                          {acting === event.id + '_approve' ? <span className="spinner" /> : <><CheckCircle size={12} /> Approve</>}
                        </button>
                      )}
                      {event.status === 'OPEN' && (
                        <button className="btn btn-secondary btn-sm" disabled={acting === event.id + '_close'} onClick={() => handleClose(event.id)}>
                          {acting === event.id + '_close' ? <span className="spinner" /> : <><XCircle size={12} /> Close</>}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
