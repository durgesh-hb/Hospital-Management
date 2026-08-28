import React, { useState, useEffect } from 'react';
import { getDoctorProfile, updateDoctorProfile, addDoctorLeave, removeDoctorLeave } from '../../services/api';
import { DoctorSidebar } from './DoctorDashboard';
import './Doctor.css';

const ALL_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const DoctorSchedule = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [newLeaveDate, setNewLeaveDate] = useState('');
  const [leaveMsg, setLeaveMsg] = useState({ text: '', type: '' });

  const [form, setForm] = useState({
    specialization: '',
    department: '',
    qualification: '',
    experience: 0,
    consultationFee: 500,
    bio: '',
    availableDays: [],
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 30,
    isAvailable: true,
    licenseNumber: '',
  });

  useEffect(() => {
    getDoctorProfile()
      .then((res) => {
        const dp = res.data.doctorProfile;
        setProfile(dp);
        if (dp) {
          setForm({
            specialization: dp.specialization || '',
            department: dp.department || '',
            qualification: Array.isArray(dp.qualification) ? dp.qualification.join(', ') : (dp.qualification || ''),
            experience: dp.experience || 0,
            consultationFee: dp.consultationFee || 500,
            bio: dp.bio || '',
            availableDays: dp.availableDays || [],
            startTime: dp.startTime || '09:00',
            endTime: dp.endTime || '17:00',
            slotDuration: dp.slotDuration || 30,
            isAvailable: dp.isAvailable !== false,
            licenseNumber: dp.licenseNumber || '',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ text: '', type: '' });
    try {
      const payload = {
        ...form,
        qualification: form.qualification.split(',').map((q) => q.trim()).filter(Boolean),
        experience: Number(form.experience),
        consultationFee: Number(form.consultationFee),
        slotDuration: Number(form.slotDuration),
      };
      await updateDoctorProfile(payload);
      setMsg({ text: '✅ Profile and schedule updated successfully!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Update failed', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 4000);
    }
  };

  const handleAddLeave = async () => {
    if (!newLeaveDate) return;
    try {
      const res = await addDoctorLeave({ dates: [newLeaveDate] });
      setProfile((p) => ({ ...p, leaveDates: res.data.leaveDates }));
      setNewLeaveDate('');
      setLeaveMsg({ text: 'Leave date added!', type: 'success' });
      setTimeout(() => setLeaveMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setLeaveMsg({ text: err.response?.data?.message || 'Failed to add leave', type: 'error' });
    }
  };

  const handleRemoveLeave = async (date) => {
    try {
      const res = await removeDoctorLeave({ date });
      setProfile((p) => ({ ...p, leaveDates: res.data.leaveDates }));
      setLeaveMsg({ text: 'Leave date removed', type: 'success' });
      setTimeout(() => setLeaveMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setLeaveMsg({ text: 'Failed to remove', type: 'error' });
    }
  };

  const previewSlots = () => {
    if (!form.startTime || !form.endTime || !form.slotDuration) return [];
    const slots = [];
    const [sh, sm] = form.startTime.split(':').map(Number);
    const [eh, em] = form.endTime.split(':').map(Number);
    let cur = sh * 60 + sm;
    const end = eh * 60 + em;
    const dur = Number(form.slotDuration);
    while (cur + dur <= end) {
      const h = Math.floor(cur / 60).toString().padStart(2, '0');
      const m = (cur % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      cur += dur;
    }
    return slots;
  };

  if (loading) return (
    <div className="dashboard-layout">
      <DoctorSidebar active="My Schedule" />
      <div className="main-content"><div className="empty-state">Loading...</div></div>
    </div>
  );

  const slots = previewSlots();

  return (
    <div className="dashboard-layout">
      <DoctorSidebar active="My Schedule" />
      <div className="main-content">
        <div className="page-header">
          <h1>My Schedule & Profile</h1>
          <p>Manage your availability, schedule, and professional details</p>
        </div>

        {msg.text && (
          <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13,
            background: msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: msg.type === 'success' ? '#34d399' : '#f87171',
            border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Profile & Schedule Form */}
          <div className="form-card">
            <h2>Professional Profile</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="form-row">
                <div className="form-field">
                  <label>Specialization *</label>
                  <input required value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Cardiology" />
                </div>
                <div className="form-field">
                  <label>Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Cardiology Dept" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Qualification (comma separated)</label>
                  <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MD, DM" />
                </div>
                <div className="form-field">
                  <label>License Number</label>
                  <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} placeholder="License #" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Experience (years)</label>
                  <input type="number" min="0" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Consultation Fee (₹)</label>
                  <input type="number" min="0" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label>Bio / About</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Brief description about yourself..." style={{ resize: 'vertical' }} />
              </div>

              <h3 style={{ color: '#e2e8f0', marginTop: 8, marginBottom: 12 }}>⏰ Schedule Settings</h3>
              <div className="form-field">
                <label>Available Days</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {ALL_DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      style={{
                        padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                        border: `2px solid ${form.availableDays.includes(day) ? '#3b82f6' : '#334155'}`,
                        background: form.availableDays.includes(day) ? 'rgba(59,130,246,0.2)' : '#1e293b',
                        color: form.availableDays.includes(day) ? '#60a5fa' : '#64748b',
                        fontWeight: form.availableDays.includes(day) ? 700 : 400,
                      }}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Slot Duration (minutes)</label>
                  <select value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: Number(e.target.value) })}>
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Accepting Appointments</label>
                  <select value={String(form.isAvailable)} onChange={(e) => setForm({ ...form, isAvailable: e.target.value === 'true' })}>
                    <option value="true">Yes - Available</option>
                    <option value="false">No - Unavailable</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="submit-btn blue" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Profile & Schedule'}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Slot Preview */}
            <div className="section-card">
              <div className="section-title">⏱ Generated Slot Preview</div>
              <div style={{ color: '#64748b', fontSize: 12, marginBottom: 12 }}>
                {form.startTime} – {form.endTime}, every {form.slotDuration} mins ({slots.length} slots)
              </div>
              {slots.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {slots.map((slot) => (
                    <span key={slot} style={{ padding: '6px 12px', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontSize: 13, border: '1px solid #334155' }}>
                      {slot}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: 13 }}>No slots generated. Check start/end times.</div>
              )}
            </div>

            {/* Leave Management */}
            <div className="section-card">
              <div className="section-title">🏖️ Leave / Unavailable Dates</div>
              {leaveMsg.text && (
                <div style={{ padding: '10px', borderRadius: 8, marginBottom: 12, fontSize: 13,
                  background: leaveMsg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: leaveMsg.type === 'success' ? '#34d399' : '#f87171' }}>
                  {leaveMsg.text}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <input type="date" value={newLeaveDate} min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewLeaveDate(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13 }} />
                <button className="btn btn-primary" onClick={handleAddLeave} style={{ whiteSpace: 'nowrap' }}>Add Leave</button>
              </div>
              {profile?.leaveDates && profile.leaveDates.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {profile.leaveDates.sort().map((date) => (
                    <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                      <span style={{ color: '#e2e8f0', fontSize: 14 }}>📅 {date}</span>
                      <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleRemoveLeave(date)}>Remove</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: 13 }}>No leave dates added</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// doctor schedule page
export default DoctorSchedule;
