import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Building2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('STUDENT');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    erpId: '', accountNumber: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (role === 'STUDENT' && !form.erpId.trim()) e.erpId = 'ERP ID is required for students';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        role,
        erpId: role === 'STUDENT' ? form.erpId : undefined,
        accountNumber: role === 'STUDENT' ? form.accountNumber : undefined,
      });
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontSize: 28, fontWeight: 800 }}>
            Crowd<span style={{ color: 'var(--accent)' }}>Coin</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Role toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: '#22c55e' },
              { id: 'STAKEHOLDER', label: 'Organizer', icon: Building2, color: '#6c63ff' },
            ].map(({ id, label, icon: Icon, color }) => (
              <button key={id} type="button" onClick={() => setRole(id)}
                style={{
                  padding: '12px', borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${role === id ? color : 'var(--border)'}`,
                  background: role === id ? color + '15' : 'var(--bg-secondary)',
                  color: role === id ? color : 'var(--text-secondary)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, fontFamily: 'Inter, sans-serif',
                  fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
                }}>
                <Icon size={16} />{label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="Ali Khan"
                value={form.name} onChange={e => set('name', e.target.value)} />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="ali@iba.edu.pk"
                value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {role === 'STUDENT' && (
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">ERP ID</label>
                  <input className={`form-input ${errors.erpId ? 'error' : ''}`} placeholder="12345"
                    value={form.erpId} onChange={e => set('erpId', e.target.value)} />
                  {errors.erpId && <span className="form-error">{errors.erpId}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="form-input" placeholder="PK36SCBL..."
                    value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className={`form-input ${errors.password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                type="password" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><span className="spinner" />Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
