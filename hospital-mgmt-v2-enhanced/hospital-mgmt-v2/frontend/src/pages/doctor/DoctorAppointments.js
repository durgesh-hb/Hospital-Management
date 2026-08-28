import React, { useState, useEffect } from 'react';
import { getDoctorAllAppointments, updateDoctorAppointment } from '../../services/api';
import { DoctorSidebar } from './DoctorDashboard';
import './Doctor.css';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ notes: '', prescription: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('approved');

  useEffect(() => {
    getDoctorAllAppointments()
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const openUpdate = (apt) => {
    setSelected(apt);
    setForm({ notes: apt.notes || '', prescription: apt.prescription || '' });
    setMsg('');
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      const res = await updateDoctorAppointment(selected._id, { status: 'completed', ...form });
      setAppointments(appointments.map((a) => a._id === selected._id ? { ...a, ...res.data } : a));
      setMsg('Marked as completed!');
      setTimeout(() => { setSelected(null); setMsg(''); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const res = await updateDoctorAppointment(selected._id, form);
      setAppointments(appointments.map((a) => a._id === selected._id ? { ...a, ...res.data } : a));
      setMsg('Saved successfully!');
      setTimeout(() => { setSelected(null); setMsg(''); }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div className="dashboard-layout">
      <DoctorSidebar active="Appointments" />
      <div className="main-content">
        <div className="page-header">
          <h1>My Appointments</h1>
          <p>View and manage your patient appointments</p>
        </div>

        {selected && (
          <div className="form-card" style={{ marginBottom: 24, borderColor: '#10b981' }}>
            <h2>Appointment — {selected.patient?.name}</h2>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              📅 {new Date(selected.appointmentDate).toLocaleDateString()} at {selected.timeSlot} | {selected.reason}
            </div>
            {msg && <div style={{ borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13,
              background: msg.includes('success') || msg.includes('complete') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: msg.includes('success') || msg.includes('complete') ? '#34d399' : '#f87171' }}>{msg}</div>}
            <div className="form-row">
              <div className="form-field">
                <label>Notes</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Appointment notes" />
              </div>
            </div>
            <div className="form-field">
              <label>Prescription</label>
              <textarea rows={3} value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                placeholder="Enter prescription details..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {selected.status === 'approved' && (
                <button className="submit-btn green" onClick={handleComplete} disabled={saving}>
                  {saving ? 'Saving...' : '✅ Mark as Completed'}
                </button>
              )}
              <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: 13 }} onClick={handleSaveNotes} disabled={saving}>
                💾 Save Notes
              </button>
              <button className="btn btn-danger" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}

        <div className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-title" style={{ margin: 0 }}>Appointments ({filtered.length})</div>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              style={{ padding: '8px 14px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13 }}>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="all">All</option>
              <option value="pending">Pending (Admin Review)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {loading ? <div className="empty-state">Loading...</div> : (
            <table className="data-table">
              <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map((apt) => (
                  <tr key={apt._id}>
                    <td>{apt.patient?.name || 'N/A'}</td>
                    <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                    <td>{apt.timeSlot}</td>
                    <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.reason}</td>
                    <td><span className={`badge badge-${apt.status}`}>{apt.status}</span></td>
                    <td>
                      {['approved', 'completed'].includes(apt.status) && (
                        <button className="btn btn-primary" onClick={() => openUpdate(apt)}>
                          {apt.status === 'approved' ? 'Manage' : 'View'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="empty-state"><div className="empty-icon">📅</div>
              {filter === 'approved' ? 'No approved appointments yet. Awaiting admin approval.' : 'No appointments found'}
            </div>
          )}
        </div>
      </div> 
    </div>
  );
};
// this is the doctor appointments page
export default DoctorAppointments;
