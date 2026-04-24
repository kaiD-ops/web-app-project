import { useEffect, useState } from 'react';
import api from '../../api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Users, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/api/stats/admin').then(r => {
      // We don't have a list users endpoint, show stats instead
      setUsers([]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="header-row">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-subtitle">Manage platform users</p>
          </div>
          <div className="search-bar">
            <Search size={15} color="var(--text-muted)" />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>}
          </div>
        </div>
      </div>
      <div className="card empty-state">
        <Users size={48} color="var(--text-muted)" />
        <h3>User management</h3>
        <p>User listing endpoint can be added in a future update. Current stats are visible on the Overview page.</p>
      </div>
    </DashboardLayout>
  );
}
