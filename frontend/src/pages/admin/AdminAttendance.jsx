import { useEffect, useState } from 'react';
import { eventsAPI, attendanceAPI } from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { CheckSquare, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAttendance() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [attendance, setAttendance] = useState({});
  const [finalizing, setFinalizing] = useState(false);
  const [finalized, setFinalized] = useState(null);

  useEffect(() => {
    eventsAPI.getAll()
      .then(r => {
        const verifiable = r.data.data.filter(e => ['AWAITING_VERIFICATION', 'COMPLETED'].includes(e.status));
        setEvents(verifiable);
      })
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const loadSheet = async (event) => {
    setSelectedEvent(event);
    setSheet(null);
    setFinalized(null);
    setLoadingSheet(true);
    try {
      const res = await attendanceAPI.getSheet(event.id);
      const data = res.data.data;
      setSheet(data);
      // Initialize attendance state
      const init = {};
      data.event.registrations.forEach(r => {
        init[r.studentId] = r.status === 'ATTENDED' || r.status === 'PAID';
      });
      setAttendance(init);
      if (event.status === 'COMPLETED') {
        const summary = await attendanceAPI.payoutSummary(event.id);
        setFinalized(summary.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance sheet');
    } finally {
      setLoadingSheet(false);
    }
  };

  const toggleAttendance = (studentId) => {
    setAttendance(a => ({ ...a, [studentId]: !a[studentId] }));
  };

  const markAll = (present) => {
    const all = {};
    sheet.event.registrations.forEach(r => { all[r.studentId] = present; });
    setAttendance(all);
  };

  const handleFinalize = async () => {
    const presentCount = Object.values(attendance).filter(Boolean).length;
    if (presentCount === 0) { toast.error('Mark at least one student as present'); return; }
    if (!confirm(`Finalize attendance for ${presentCount} students and disburse payments? This cannot be undone.`)) return;

    setFinalizing(true);
    try {
      // Bulk mark first
      const attendanceList = Object.entries(attendance).map(([studentId, isPresent]) => ({
        studentId: parseInt(studentId), isPresent,
      }));
      await attendanceAPI.bulkMark(selectedEvent.id, attendanceList);
      // Then finalize
      const res = await attendanceAPI.finalize(selectedEvent.id);
      const summary = res.data.data;
      setFinalized(summary);
      toast.success(`Payments disbursed to ${summary.totalAttended} students!`);
      setEvents(ev => ev.map(e => e.id === selectedEvent.id ? { ...e, status: 'COMPLETED' } : e));
      setSelectedEvent(e => ({ ...e, status: 'COMPLETED' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Finalization failed');
    } finally {
      setFinalizing(false);
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = sheet?.event?.registrations?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Attendance Manager</h1>
        <p className="page-subtitle">Verify attendance and disburse payments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Event list */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Events Ready for Verification
          </h3>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><div className="spinner" /></div>
          ) : events.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px 0' }}>
              <CheckSquare size={32} color="var(--text-muted)" />
              <h3 style={{ fontSize: 14 }}>No events pending</h3>
              <p style={{ fontSize: 12 }}>Close an open event first</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {events.map(event => (
                <button key={event.id} onClick={() => loadSheet(event)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${selectedEvent?.id === event.id ? 'var(--accent)' : 'var(--border)'}`, background: selectedEvent?.id === event.id ? 'var(--accent-light)' : 'var(--bg-secondary)', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{event.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(event.date).toLocaleDateString()}</div>
                  <span className={`badge badge-${event.status.toLowerCase()}`} style={{ marginTop: 6 }}>{event.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attendance sheet */}
        <div>
          {!selectedEvent ? (
            <div className="card empty-state">
              <CheckSquare size={48} color="var(--text-muted)" />
              <h3>Select an event</h3>
              <p>Choose an event from the left to manage attendance</p>
            </div>
          ) : loadingSheet ? (
            <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
            </div>
          ) : sheet ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Summary bar */}
              <div className="card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selectedEvent.title}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(selectedEvent.date).toLocaleDateString()} · {selectedEvent.venue}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[
                      { label: 'Registered', value: totalCount, color: 'var(--accent)' },
                      { label: 'Present', value: presentCount, color: 'var(--success)' },
                      { label: 'Absent', value: totalCount - presentCount, color: 'var(--danger)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payout result */}
              {finalized && (
                <div style={{ padding: '16px 20px', background: 'var(--success-light)', borderRadius: 'var(--radius)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircle size={16} color="var(--success)" />
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>Payments Disbursed Successfully</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Attended: <strong style={{ color: 'var(--text-primary)' }}>{finalized.totalAttended}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Per student: <strong style={{ color: 'var(--success)' }}>PKR {finalized.payoutPerStudent}</strong></span>
                    <span style={{ color: 'var(--text-secondary)' }}>Total: <strong style={{ color: 'var(--success)' }}>PKR {finalized.totalDisbursed?.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              {/* Controls */}
              {selectedEvent.status === 'AWAITING_VERIFICATION' && !finalized && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-success btn-sm" onClick={() => markAll(true)}>
                    <CheckCircle size={13} /> Mark All Present
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => markAll(false)}>
                    <XCircle size={13} /> Mark All Absent
                  </button>
                  <div style={{ flex: 1 }} />
                  <button className="btn btn-primary" disabled={finalizing || presentCount === 0} onClick={handleFinalize}>
                    {finalizing ? <><span className="spinner" />Processing...</> : <><DollarSign size={14} />Finalize & Disburse ({presentCount} students)</>}
                  </button>
                </div>
              )}

              {/* Student list */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Users size={15} color="var(--text-secondary)" />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Student Attendance</span>
                </div>
                {sheet.event.registrations.length === 0 ? (
                  <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No students registered</p>
                ) : (
                  <div>
                    {sheet.event.registrations.map((reg, i) => (
                      <div key={reg.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: i < sheet.event.registrations.length - 1 ? '1px solid var(--border)' : 'none', background: attendance[reg.studentId] ? 'rgba(34,197,94,0.04)' : 'transparent', transition: 'background 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>
                            {reg.student.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{reg.student.name}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>ERP: {reg.student.erpId}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {(reg.status === 'PAID' || reg.status === 'ATTENDED') ? (
                            <span className={`badge badge-${reg.status.toLowerCase()}`}>{reg.status}</span>
                          ) : selectedEvent.status === 'AWAITING_VERIFICATION' ? (
                            <button onClick={() => toggleAttendance(reg.studentId)}
                              style={{ width: 28, height: 28, borderRadius: 6, border: `2px solid ${attendance[reg.studentId] ? 'var(--success)' : 'var(--border)'}`, background: attendance[reg.studentId] ? 'var(--success)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                              {attendance[reg.studentId] && <CheckCircle size={14} color="#fff" />}
                            </button>
                          ) : (
                            <span className={`badge badge-${reg.status.toLowerCase()}`}>{reg.status}</span>
                          )}
                          <span style={{ fontSize: 13, color: attendance[reg.studentId] ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                            {attendance[reg.studentId] ? `PKR ${selectedEvent.payoutPerStudent}` : '—'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
