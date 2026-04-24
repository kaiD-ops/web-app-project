import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { ArrowRight, Users, DollarSign, CheckCircle, Zap } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const routes = { STUDENT: '/student/dashboard', STAKEHOLDER: '/stakeholder/dashboard', ADMIN: '/admin/dashboard' };
      navigate(routes[user.role]);
    }
  }, [user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
        <span style={{ fontSize: 24, fontWeight: 800 }}>Crowd<span style={{ color: 'var(--accent)' }}>Coin</span></span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 20px 80px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent-light)', color: 'var(--accent)', padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          <Zap size={14} /> IBA Karachi's Audience Platform
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
          Get Paid to{' '}
          <span style={{ color: 'var(--accent)' }}>Attend Events</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          CrowdCoin connects event organizers with students. Earn money by attending speaker sessions on campus.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Earning <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div className="grid-3" style={{ gap: 24 }}>
          {[
            { icon: DollarSign, color: 'var(--success)', title: 'Earn Per Session', desc: 'Get paid directly to your wallet for every event you attend. Transparent, instant payouts.' },
            { icon: Users, color: 'var(--accent)', title: 'Fill Any Event', desc: 'Organizers get a guaranteed audience. Students get paid. Everyone wins.' },
            { icon: CheckCircle, color: 'var(--warning)', title: 'Verified Attendance', desc: 'Admin verifies attendance after each session. Fair and transparent payment distribution.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color }}>
                <Icon size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 20px 80px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-accent)', borderRadius: 20, padding: '48px', maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ready to start earning?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>Register as a student and start browsing available events today.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Create Account <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 13 }}>
        © 2025 CrowdCoin — IBA Karachi
      </footer>
    </div>
  );
}
