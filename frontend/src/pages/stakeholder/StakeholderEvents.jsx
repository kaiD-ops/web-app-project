import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI, attendanceAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, Users, Trash2, Eye, DollarSign, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StakeholderEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [payoutSummary, setPayoutSummary] = useState(null);

  useEffect(() => {
    eventsAPI.getMy().then(r => setEvents(r.data.data)).catch(() => toast.error('Failed to load events')).finally(() => setLoading(false));
  }, []);

  const viewEvent = async (event) => {
    setSelected(event);
    setLoadingRegs(true);
    setPayoutSummary(null);
    try {
      const regs = await registrationsAPI.eventRegistrations(event.id);
      setRegistrations(regs.data.data);
      if (event.status === 'COMPLETED') {
        const summary = await attendanceAPI.payoutSummary(event.id);
        setPayoutSummary(summary.data.data);
      }
    } catch {
      setRegistrations([]);
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Delete this event? This cannot be undone.')) return;
    try {
      await eventsAPI.delete(eventId);
      toast.success('Event deleted');
      setEvents(e => e.filter(ev => ev.id !== eventId));
      if (selected?.id === eventId) setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete');
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">My Events</h1>
            <p className="page-subtitle">{events.length} events created</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/stakeholder/create-event')}>
            <PlusCircle size={16} /> Create Event
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Events list */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} /></div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} color="var(--text-muted)" />
              <h3>No events yet</h3>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/stakeholder/create-event')}>Create your first event</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {events.map(event => {
                const filled = event._count?.registrations ?? 0;
                const fillPct = Math.min(100, Math.round((filled / event.requiredStudents) * 100));
                return (
                  <div key={event.id} className="card" style={{ cursor: 'pointer', border: selected?.id === event.id ? '1px solid var(--accent)' : undefined }}
                    onClick={() => viewEvent(event)}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontWeight: 700, fontSize: 15 }}>{event.title}</h3>
                          <span className={`badge badge-${event.status.toLowerCase()}`}>{event.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{new Date(event.date).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} />{filled}/{event.requiredStudents}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><DollarSign size={11} />PKR {event.payoutPerStudent}/student</span>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${fillPct}%`, background: 'var(--accent)', borderRadius: 2 }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); viewEvent(event); }}><Eye size={13} /></button>
                        {event.status === 'PENDING' && (
                          <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); handleDelete(event.id); }}><Trash2 size={13} /></button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Event detail panel */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: 20, alignSelf: 'start', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selected.title}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
            </div>

            {payoutSummary && (
              <div style={{ padding: '12px 14px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, marginBottom: 4 }}>PAYOUT SUMMARY</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Attended</span><span style={{ fontWeight: 600 }}>{payoutSummary.totalAttended}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Disbursed</span><span style={{ fontWeight: 600, color: 'var(--success)' }}>PKR {payoutSummary.totalDisbursed?.toLocaleString()}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Remaining</span><span style={{ fontWeight: 600 }}>PKR {payoutSummary.budgetRemaining?.toLocaleString()}</span>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
              Registrations ({registrations.length})
            </h3>
            {loadingRegs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><div className="spinner" /></div>
            ) : registrations.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No registrations yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {registrations.map(reg => (
                  <div key={reg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{reg.student.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>ERP: {reg.student.erpId}</p>
                    </div>
                    <span className={`badge badge-${reg.status.toLowerCase()}`}>{reg.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
