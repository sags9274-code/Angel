import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './Profile.css';

export default function Profile() {
  const { user, role, username, setUsername, avatarUrl, setAvatarUrl } = useAuth();
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

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event) => {
    try {
      setIsUploadingAvatar(true);
      setSaveStatus({ message: 'Uploading avatar...', type: 'info' });
      
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newAvatarUrl = urlData.publicUrl;

      // Update profile record
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      setSaveStatus({ message: 'Avatar updated successfully!', type: 'success' });
      setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus({ message: 'Error uploading avatar.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      if (!avatarUrl) return;
      setIsUploadingAvatar(true);
      setSaveStatus({ message: 'Removing avatar...', type: 'info' });
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      setSaveStatus({ message: 'Avatar removed successfully!', type: 'success' });
      setTimeout(() => setSaveStatus({ message: '', type: '' }), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus({ message: 'Error removing avatar.', type: 'error' });
    } finally {
      setIsUploadingAvatar(false);
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div className="profile-avatar-large" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-upload').click()}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile-avatar-img" />
              ) : (
                role === 'goddess' ? '👑' : role === 'developer' ? '💻' : '👤'
              )}
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleAvatarUpload} 
                disabled={isUploadingAvatar}
              />
              {isUploadingAvatar && <div className="profile-avatar-loading">⏳</div>}
            </div>
            {avatarUrl && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-accent)',
                  color: 'var(--color-accent)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Remove Pic
              </button>
            )}
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
                <h2 className="profile-username">@{username || 'Set_Username'}</h2>
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
