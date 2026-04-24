import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Users, CheckSquare,
  LogOut, Menu, X, Wallet, Briefcase, PlusCircle,
  BarChart3, ClipboardList, Star
} from 'lucide-react';

const navLinks = {
  STUDENT: [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/events', icon: Calendar, label: 'Browse Events' },
    { to: '/student/my-gigs', icon: Briefcase, label: 'My Gigs' },
    { to: '/student/wallet', icon: Wallet, label: 'My Wallet' },
  ],
  STAKEHOLDER: [
    { to: '/stakeholder/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stakeholder/events', icon: Calendar, label: 'My Events' },
    { to: '/stakeholder/create-event', icon: PlusCircle, label: 'Create Event' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', icon: BarChart3, label: 'Overview' },
    { to: '/admin/events', icon: Calendar, label: 'All Events' },
    { to: '/admin/attendance', icon: CheckSquare, label: 'Attendance' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ],
};

const roleColors = {
  STUDENT: '#22c55e',
  STAKEHOLDER: '#6c63ff',
  ADMIN: '#f59e0b',
};

const roleLabels = {
  STUDENT: 'Student',
  STAKEHOLDER: 'Stakeholder',
  ADMIN: 'Admin',
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = navLinks[user?.role] || [];
  const roleColor = roleColors[user?.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {!collapsed && (
            <span className="logo-text">Crowd<span style={{ color: 'var(--accent)' }}>Coin</span></span>
          )}
          {collapsed && <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 20 }}>C</span>}
        </div>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: roleColor + '22', color: roleColor }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role" style={{ color: roleColor }}>
              {roleLabels[user?.role]}
            </span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        {!collapsed && <span>Logout</span>}
      </button>
    </aside>
  );

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`}>
        <Sidebar />
      </div>

      {/* Desktop sidebar */}
      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main className="main-content">
        <div className="mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="logo-text">Crowd<span style={{ color: 'var(--accent)' }}>Coin</span></span>
        </div>
        <div className="content-inner">
          {children}
        </div>
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }
        .sidebar {
          width: 240px;
          min-height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar.collapsed { width: 68px; }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
          min-height: 64px;
        }
        .logo-text { font-size: 20px; font-weight: 800; color: var(--text-primary); }
        .collapse-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
        }
        .collapse-btn:hover { color: var(--text-primary); background: var(--bg-card); }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid var(--border);
        }
        .user-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 15px;
          flex-shrink: 0;
        }
        .user-info { display: flex; flex-direction: column; overflow: hidden; }
        .user-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .user-role { font-size: 12px; font-weight: 600; }
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .nav-link:hover { color: var(--text-primary); background: var(--bg-card); }
        .nav-link.active { color: var(--accent); background: var(--accent-light); font-weight: 600; }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          margin: 8px;
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .logout-btn:hover { color: var(--danger); background: var(--danger-light); }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }
        .content-inner {
          padding: 32px;
          flex: 1;
          max-width: 1200px;
          width: 100%;
        }
        .desktop-sidebar { display: flex; }
        .mobile-sidebar { display: none; }
        .mobile-topbar { display: none; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none; }
          .mobile-sidebar {
            display: block;
            position: fixed;
            left: -260px;
            top: 0;
            z-index: 200;
            transition: left 0.25s ease;
            height: 100vh;
          }
          .mobile-sidebar.open { left: 0; }
          .mobile-sidebar .sidebar { width: 240px; }
          .mobile-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 199;
          }
          .mobile-topbar {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 20px;
            border-bottom: 1px solid var(--border);
            background: var(--bg-secondary);
          }
          .mobile-menu-btn {
            background: none; border: none;
            color: var(--text-primary); cursor: pointer;
          }
          .content-inner { padding: 20px; }
        }
      `}</style>
    </div>
  );
}
