import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './Profile.css';

export default function Profile() {
  const { user, role, username, setUsername } = useAuth();
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [saveStatus, setSaveStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    if (user) {
      setNewUsername(username || '');
      fetchProfileData(user.id);
    }
  }, [user, username]);

  const fetchProfileData = async (userId) => {
    setLoading(true);
    try {
      // Fetch Total Points via our RPC function
      const { data: pointsData, error: pointsError } = await supabase
        .rpc('get_user_points', { user_uuid: userId });
        
      if (!pointsError && pointsData !== null) {
        setPoints(pointsData);
      }

      // Fetch User Badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          badges (
            id,
            name,
            description,
            icon,
            rarity
          )
        `)
        .eq('user_id', userId);

      if (!badgesError && badgesData) {
        setBadges(badgesData.map(b => b.badges));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    
    setSaveStatus({ message: 'Saving...', type: 'info' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) {
        setSaveStatus({ message: 'Error updating username. It might be taken.', type: 'error' });
      } else {
        setUsername(newUsername.trim());
        setIsEditingUsername(false);
        setSaveStatus({ message: 'Username updated successfully!', type: 'success' });
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
      }
    } catch (err) {
      setSaveStatus({ message: 'Unexpected error.', type: 'error' });
    }
  };

  if (!user) {
    return (
      <div className="page profile-page">
        <div className="profile-auth-warning">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  return (
    <div className="page profile-page">
      <header className="page__header">
        <h1 className="page__title">Your Profile</h1>
        <p className="page__subtitle">Manage your identity and showcase your loyalty.</p>
      </header>

      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">
            {role === 'goddess' ? '👑' : role === 'developer' ? '💻' : '👤'}
          </div>
          
          <div className="profile-info">
            {isEditingUsername ? (
              <form className="profile-username-form" onSubmit={handleUpdateUsername}>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="profile-username-input"
                  placeholder="Enter new username"
                  maxLength={20}
                  autoFocus
                />
                <button type="submit" className="profile-btn-save">Save</button>
                <button type="button" className="profile-btn-cancel" onClick={() => setIsEditingUsername(false)}>Cancel</button>
              </form>
            ) : (
              <div className="profile-username-display">
                <h2 className="profile-username">@{username || 'Loading...'}</h2>
                <button className="profile-edit-icon" onClick={() => setIsEditingUsername(true)} title="Edit Username">
                  ✏️
                </button>
              </div>
            )}
            
            {saveStatus.message && (
              <div className={`profile-status profile-status--${saveStatus.type}`}>
                {saveStatus.message}
              </div>
            )}

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-label">Role</span>
                <span className={`profile-stat-value role-badge role-badge--${role}`}>
                  {role || 'Unknown'}
                </span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-label">Total Points</span>
                <span className="profile-stat-value points-highlight">
                  {loading ? '...' : points}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Showcase */}
        <div className="profile-section">
          <h3 className="profile-section-title">Your Badges Showcase</h3>
          {loading ? (
            <p className="profile-loading">Loading your collection...</p>
          ) : badges.length === 0 ? (
            <div className="profile-empty-state">
              <p>You haven't redeemed any badges yet.</p>
              <p className="profile-empty-sub">Complete free tasks and visit the Redemption Store to earn them!</p>
            </div>
          ) : (
            <div className="profile-badges-grid">
              {badges.map((badge, idx) => (
                <div key={idx} className={`profile-badge-card rarity--${badge.rarity}`}>
                  <div className="profile-badge-icon">{badge.icon}</div>
                  <div className="profile-badge-name">{badge.name}</div>
                  <div className="profile-badge-desc">{badge.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
