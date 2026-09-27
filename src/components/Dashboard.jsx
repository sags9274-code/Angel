import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  
  const isGoddessOrDev = role === 'goddess' || role === 'developer';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubs: 0,
    totalTasksCompleted: 0,
    totalShamePosts: 0,
  });
  const [subs, setSubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && !isGoddessOrDev) {
      navigate('/');
    } else if (user && isGoddessOrDev) {
      fetchDashboardData();
    }
  }, [user, role, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Subs
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'sub')
        .order('created_at', { ascending: false });

      // Fetch Tasks Completions
      const { data: completionsData } = await supabase
        .from('task_completions')
        .select('user_id, tasks(points)');
        
      // Fetch Redemptions
      const { data: redemptionsData } = await supabase
        .from('redemptions')
        .select('user_id, cost');

      // Fetch Wall of Shame count
      const { count: shameCount } = await supabase
        .from('wall_of_shame')
        .select('*', { count: 'exact', head: true });

      // Aggregate data
      const subsMap = {};
      const profiles = profilesData || [];
      
      profiles.forEach(p => {
        subsMap[p.id] = {
          id: p.id,
          email: p.username || 'Unknown',
          joined: new Date(p.created_at).toLocaleDateString(),
          earned: 0,
          spent: 0,
          tasksCompleted: 0
        };
      });

      if (completionsData) {
        completionsData.forEach(c => {
          if (subsMap[c.user_id]) {
            subsMap[c.user_id].earned += (c.tasks?.points || 0);
            subsMap[c.user_id].tasksCompleted += 1;
          }
        });
      }

      if (redemptionsData) {
        redemptionsData.forEach(r => {
          if (subsMap[r.user_id]) {
            subsMap[r.user_id].spent += (r.cost || 0);
          }
        });
      }
      
      const subsArray = Object.values(subsMap);

      setStats({
        totalSubs: profiles.length,
        totalTasksCompleted: completionsData ? completionsData.length : 0,
        totalShamePosts: shameCount || 0
      });
      
      setSubs(subsArray);
    } catch (err) {
      console.error("Dashboard error:", err);
    }
    setLoading(false);
  };

  const filteredSubs = subs.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    sub.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isGoddessOrDev) return null;

  return (
    <div className="page dashboard-page" style={{ paddingTop: '100px', minHeight: '100vh', padding: '100px 20px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="page__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page__title" style={{ color: 'var(--color-gold)' }}>Admin Dashboard</h1>
        <p className="page__subtitle">Track your subjects' loyalty and performance.</p>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-gold)' }}>Loading empire data...</p>
      ) : (
        <>
          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="dashboard-stat-card">
              <h3>Total Subs</h3>
              <p className="dashboard-stat-value">{stats.totalSubs}</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>Tasks Completed</h3>
              <p className="dashboard-stat-value">{stats.totalTasksCompleted}</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>Wall of Shame Posts</h3>
              <p className="dashboard-stat-value">{stats.totalShamePosts}</p>
            </div>
          </div>

          {/* Subs Roster */}
          <div className="dashboard-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ color: 'var(--color-gold)', margin: 0 }}>Sub Roster</h2>
              <input 
                type="text" 
                placeholder="Search by username or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="wishlist__tribute-input"
                style={{ width: '100%', maxWidth: '300px' }}
              />
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Sub ID / Username</th>
                    <th>Joined Date</th>
                    <th>Tasks Completed</th>
                    <th>Points Earned</th>
                    <th>Points Spent</th>
                    <th>Available Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.length > 0 ? (
                    filteredSubs.map(sub => (
                      <tr key={sub.id}>
                        <td>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{sub.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{sub.id.substring(0, 8)}...</div>
                        </td>
                        <td>{sub.joined}</td>
                        <td>{sub.tasksCompleted}</td>
                        <td style={{ color: 'var(--color-gold)' }}>+{sub.earned}</td>
                        <td style={{ color: 'var(--color-accent)' }}>-{sub.spent}</td>
                        <td style={{ fontWeight: 'bold' }}>{sub.earned - sub.spent}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No subs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
