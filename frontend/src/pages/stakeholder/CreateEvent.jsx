import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { PlusCircle, Trash2, DollarSign, Calculator } from 'lucide-react';
import toast from 'react-hot-toast';

const emptySubEvent = { title: '', speaker: '', description: '', startTime: '', endTime: '' };

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '', description: '', date: '', duration: '', venue: '',
    requiredStudents: '', totalBudget: '',
  });
  const [subEvents, setSubEvents] = useState([]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const platformFee = form.totalBudget ? (parseFloat(form.totalBudget) * 0.1).toFixed(0) : 0;
  const payout = form.totalBudget && form.requiredStudents
    ? ((parseFloat(form.totalBudget) - parseFloat(platformFee)) / parseInt(form.requiredStudents)).toFixed(0)
    : 0;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title required';
    if (!form.description.trim()) e.description = 'Description required';
    if (!form.date) e.date = 'Date required';
    if (!form.duration || form.duration <= 0) e.duration = 'Valid duration required';
    if (!form.venue.trim()) e.venue = 'Venue required';
    if (!form.requiredStudents || form.requiredStudents <= 0) e.requiredStudents = 'Must be > 0';
    if (!form.totalBudget || form.totalBudget <= 0) e.totalBudget = 'Must be > 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await eventsAPI.create({
        ...form,
        duration: parseInt(form.duration),
        requiredStudents: parseInt(form.requiredStudents),
        totalBudget: parseFloat(form.totalBudget),
        subEvents: subEvents.filter(se => se.title.trim()),
      });
      toast.success('Event created! Awaiting admin approval.');
      navigate('/stakeholder/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const addSubEvent = () => setSubEvents(s => [...s, { ...emptySubEvent }]);
  const removeSubEvent = (i) => setSubEvents(s => s.filter((_, idx) => idx !== i));
  const updateSubEvent = (i, k, v) => setSubEvents(s => s.map((se, idx) => idx === i ? { ...se, [k]: v } : se));

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">Create Event</h1>
            <p className="page-subtitle">Fill in the details to post a new event</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic details */}
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Event Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Event Title</label>
                  <input className={`form-input ${errors.title ? 'error' : ''}`} placeholder="Tech Talk: AI in Healthcare"
                    value={form.title} onChange={e => set('title', e.target.value)} />
                  {errors.title && <span className="form-error">{errors.title}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className={`form-input ${errors.description ? 'error' : ''}`} placeholder="Describe the event..."
                    value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 90 }} />
                  {errors.description && <span className="form-error">{errors.description}</span>}
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Date & Time</label>
                    <input className={`form-input ${errors.date ? 'error' : ''}`} type="datetime-local"
                      value={form.date} onChange={e => set('date', e.target.value)} />
                    {errors.date && <span className="form-error">{errors.date}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (minutes)</label>
                    <input className={`form-input ${errors.duration ? 'error' : ''}`} type="number" placeholder="120"
                      value={form.duration} onChange={e => set('duration', e.target.value)} />
                    {errors.duration && <span className="form-error">{errors.duration}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Venue</label>
                  <input className={`form-input ${errors.venue ? 'error' : ''}`} placeholder="IBA Main Auditorium"
                    value={form.venue} onChange={e => set('venue', e.target.value)} />
                  {errors.venue && <span className="form-error">{errors.venue}</span>}
                </div>
              </div>
            </div>

            {/* Sub-events */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Sessions / Sub-Events</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addSubEvent}>
                  <PlusCircle size={14} /> Add Session
                </button>
              </div>
              {subEvents.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>No sessions added. Click "Add Session" to break your event into parts.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {subEvents.map((se, i) => (
                    <div key={i} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', position: 'relative' }}>
                      <button type="button" onClick={() => removeSubEvent(i)}
                        style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                        <Trash2 size={14} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Session Title</label>
                            <input className="form-input" placeholder="Opening Keynote"
                              value={se.title} onChange={e => updateSubEvent(i, 'title', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Speaker</label>
                            <input className="form-input" placeholder="Dr. Ali Shah"
                              value={se.speaker} onChange={e => updateSubEvent(i, 'speaker', e.target.value)} />
                          </div>
                        </div>
                        <div className="form-grid">
                          <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input className="form-input" type="datetime-local"
                              value={se.startTime} onChange={e => updateSubEvent(i, 'startTime', e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">End Time</label>
                            <input className="form-input" type="datetime-local"
                              value={se.endTime} onChange={e => updateSubEvent(i, 'endTime', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column - budget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Budget & Audience</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Required Students</label>
                  <input className={`form-input ${errors.requiredStudents ? 'error' : ''}`} type="number" placeholder="50"
                    value={form.requiredStudents} onChange={e => set('requiredStudents', e.target.value)} />
                  {errors.requiredStudents && <span className="form-error">{errors.requiredStudents}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Total Budget (PKR)</label>
                  <input className={`form-input ${errors.totalBudget ? 'error' : ''}`} type="number" placeholder="5000"
                    value={form.totalBudget} onChange={e => set('totalBudget', e.target.value)} />
                  {errors.totalBudget && <span className="form-error">{errors.totalBudget}</span>}
                </div>
              </div>
            </div>

            {/* Payout calculator */}
            <div className="card" style={{ border: '1px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Calculator size={16} color="var(--accent)" />
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Payout Calculator</h2>
              </div>
              {[
                { label: 'Total Budget', value: `PKR ${parseFloat(form.totalBudget || 0).toLocaleString()}` },
                { label: 'Platform Fee (10%)', value: `− PKR ${parseFloat(platformFee).toLocaleString()}`, color: 'var(--danger)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ color: color || 'var(--text-primary)', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '12px 14px', background: 'var(--success-light)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 600, fontSize: 13 }}>
                  <DollarSign size={14} /> Per Student Payout
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--success)' }}>PKR {payout}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" />Publishing...</> : 'Publish Event'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>Event will be reviewed by admin before going live</p>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}
