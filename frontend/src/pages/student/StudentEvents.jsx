import { useEffect, useState } from 'react';
import { eventsAPI, registrationsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, MapPin, Users, DollarSign, Clock, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

function EventCard({ event, onRegister, registering }) {
  const [expanded, setExpanded] = useState(false);
  const filled = event._count?.registrations ?? 0;
  const fillPct = Math.min(100, Math.round((filled / event.requiredStudents) * 100));
  const isFull = filled >= event.requiredStudents;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{event.title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{event.stakeholder?.name}</p>
        </div>
        <span className="badge badge-open">Open</span>
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{event.description?.slice(0, 120)}{event.description?.length > 120 ? '...' : ''}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { icon: Calendar, text: new Date(event.date).toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric' }) },
          { icon: Clock, text: `${event.duration} mins` },
          { icon: MapPin, text: event.venue },
          { icon: Users, text: `${filled} / ${event.requiredStudents} spots` },
        ].map(({ icon: Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Icon size={13} />{text}
          </div>
        ))}
      </div>

      {/* Fill bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Spots filled</span><span>{fillPct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
          <div style={{ height: '100%', width: `${fillPct}%`, background: isFull ? 'var(--danger)' : 'var(--success)', borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Payout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 13, fontWeight: 600 }}>
          <DollarSign size={14} /> Payout per attendee
        </div>
        <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: 16 }}>PKR {event.payoutPerStudent}</span>
      </div>

      {/* Sub-events */}
      {event.subEvents?.length > 0 && (
        <div>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            {expanded ? '▲ Hide' : '▼ Show'} {event.subEvents.length} session{event.subEvents.length > 1 ? 's' : ''}
          </button>
          {expanded && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {event.subEvents.map(se => (
                <div key={se.id} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{se.title}</span>
                  {se.speaker && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>— {se.speaker}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        className={`btn ${isFull ? 'btn-secondary' : 'btn-primary'} btn-full`}
        disabled={isFull || registering === event.id}
        onClick={() => onRegister(event.id)}
      >
        {registering === event.id ? <><span className="spinner" />Registering...</> : isFull ? 'Event Full' : 'Confirm Availability'}
      </button>
    </div>
  );
}

export default function StudentEvents() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    eventsAPI.getOpen().then(r => {
      setEvents(r.data.data);
      setFiltered(r.data.data);
    }).catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(events); return; }
    const q = search.toLowerCase();
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.stakeholder?.name?.toLowerCase().includes(q)
    ));
  }, [search, events]);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await registrationsAPI.register(eventId);
      toast.success('Registered! You\'ll be notified 1 hour before the event.');
      // Update count locally
      setEvents(ev => ev.map(e => e.id === eventId ? { ...e, _count: { registrations: (e._count?.registrations ?? 0) + 1 } } : e));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">Browse Events</h1>
            <p className="page-subtitle">{filtered.length} events available</p>
          </div>
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} color="var(--text-muted)" />
          <h3>{search ? 'No events match your search' : 'No events available'}</h3>
          <p>{search ? 'Try a different keyword' : 'Check back soon for upcoming events'}</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} onRegister={handleRegister} registering={registering} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
