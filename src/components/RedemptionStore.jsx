import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function RedemptionStore() {
  const { user, role } = useAuth();
  
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form State for Goddess/Dev
  const [newBadgeTitle, setNewBadgeTitle] = useState('');
  const [newBadgeDesc, setNewBadgeDesc] = useState('');
  const [newBadgeIcon, setNewBadgeIcon] = useState('💎');
  const [newBadgeCost, setNewBadgeCost] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isGoddessOrDev = role === 'goddess' || role === 'developer';
  const isSub = role === 'sub';

  useEffect(() => {
    fetchStoreData();
  }, [user]);

  const fetchStoreData = async () => {
    setLoading(true);
    
    // 1. Fetch all badges
    const { data: badgesData, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .order('cost', { ascending: true });

    if (badgesError) console.error('Error fetching badges:', badgesError);
    else setBadges(badgesData || []);

    if (user && isSub) {
      // 2. Fetch User's Badges
      const { data: userBadgesData, error: ubError } = await supabase
        .from('user_badges')
        .select('badge_id, badges(*)')
        .eq('user_id', user.id);

      if (ubError) console.error('Error fetching user badges:', ubError);
      else setUserBadges(userBadgesData || []);

      // 3. Calculate Points Balance
      // Total Earned
      const { data: completions, error: compError } = await supabase
        .from('task_completions')
        .select('task_id, tasks(points)')
        .eq('user_id', user.id);

      let earned = 0;
      if (completions) {
        earned = completions.reduce((acc, comp) => acc + (comp.tasks?.points || 0), 0);
      }

      // Total Spent
      let spent = 0;
      if (userBadgesData) {
        spent = userBadgesData.reduce((acc, ub) => acc + (ub.badges?.cost || 0), 0);
      }

      setPointsBalance(earned - spent);
    }

    setLoading(false);
  };

  const handleAddBadge = async (e) => {
    e.preventDefault();
    if (!newBadgeTitle || !newBadgeIcon) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('badges')
      .insert([{
        title: newBadgeTitle,
        description: newBadgeDesc,
        icon: newBadgeIcon,
        cost: parseInt(newBadgeCost, 10),
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding badge:', error);
      alert('Error adding badge. Check console.');
    } else if (data) {
      setBadges([...badges, data].sort((a, b) => a.cost - b.cost));
      setNewBadgeTitle('');
      setNewBadgeDesc('');
      setNewBadgeIcon('💎');
      setNewBadgeCost(50);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm("Are you sure you want to delete this badge?")) return;

    const { error } = await supabase
      .from('badges')
      .delete()
      .eq('id', badgeId);

    if (error) {
      console.error('Error deleting badge:', error);
      alert('Error deleting badge.');
    } else {
      setBadges(badges.filter(b => b.id !== badgeId));
    }
  };

  const handleClaimBadge = async (badge) => {
    if (pointsBalance < badge.cost) {
      alert("You don't have enough points for this badge!");
      return;
    }

    const hasBadge = userBadges.some(ub => ub.badge_id === badge.id);
    if (hasBadge) {
      alert("You already own this badge.");
      return;
    }

    const { error } = await supabase
      .from('user_badges')
      .insert([{ user_id: user.id, badge_id: badge.id }]);

    if (error) {
      console.error('Error claiming badge:', error);
      alert('Failed to claim badge.');
    } else {
      // Optimistically update UI
      setUserBadges([...userBadges, { badge_id: badge.id, badges: badge }]);
      setPointsBalance(prev => prev - badge.cost);
      alert(`Successfully claimed: ${badge.title}`);
    }
  };

  const ownedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  return (
    <div className="page tasks-page" id="store-page">
      <header className="page__header">
        <h1 className="page__title">Redemption Store</h1>
        <p className="page__subtitle">
          Exchange your hard-earned points for exclusive badges of honor.
        </p>
      </header>

      {/* Sub Stats Area */}
      {isSub && (
        <section className="tasks__stats-container" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div className="tasks__points-card" style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'inline-block' }}>
            <span className="tasks__points-label" style={{ display: 'block', fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Available Balance</span>
            <span className="tasks__points-value" style={{ display: 'block', fontSize: '3.5rem', color: 'var(--color-gold)', fontFamily: 'var(--font-display)', marginBottom: '0', textShadow: '0 0 20px rgba(212,168,67,0.4)' }}>{pointsBalance}</span>
          </div>

          {/* Owned Badges Display */}
          {userBadges.length > 0 && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gold)' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Your Trophies</h3>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {userBadges.map(ub => (
                  <div key={ub.badge_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 0 10px rgba(212,168,67,0.5))' }}>{ub.badges?.icon}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{ub.badges?.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Goddess / Dev Add Badge Form */}
      {isGoddessOrDev && (
        <section className="tasks__admin-section" style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '3rem' }}>
          <h2 className="tasks__admin-title" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1rem' }}>Create New Badge</h2>
          <form className="tasks__admin-form" onSubmit={handleAddBadge} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Emoji Icon</label>
                <input
                  type="text"
                  placeholder="💎"
                  value={newBadgeIcon}
                  onChange={(e) => setNewBadgeIcon(e.target.value)}
                  required
                  className="wishlist__tribute-input"
                  style={{ fontSize: '1.5rem', textAlign: 'center' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Badge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Good Boy, Devoted Pig"
                  value={newBadgeTitle}
                  onChange={(e) => setNewBadgeTitle(e.target.value)}
                  required
                  className="wishlist__tribute-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Description (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Awarded for exceptional obedience."
                value={newBadgeDesc}
                onChange={(e) => setNewBadgeDesc(e.target.value)}
                className="wishlist__tribute-input"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Point Cost</label>
              <input
                type="number"
                placeholder="50"
                value={newBadgeCost}
                onChange={(e) => setNewBadgeCost(e.target.value)}
                required
                min="1"
                className="wishlist__tribute-input"
              />
            </div>

            <button type="submit" className="wishlist__tribute-btn" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
              {isSubmitting ? 'Creating...' : 'Create Badge'}
            </button>
          </form>
        </section>
      )}

      {/* Badges Storefront */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-gold)' }}>Loading Store...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {badges.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, gridColumn: '1 / -1' }}>No badges available yet.</p>}
          
          {badges.map((badge) => {
            const isOwned = ownedBadgeIds.has(badge.id);
            const canAfford = pointsBalance >= badge.cost;

            return (
              <div
                key={badge.id}
                style={{
                  background: isOwned ? 'rgba(212,168,67,0.1)' : 'var(--color-bg-card)',
                  border: isOwned ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isOwned && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--color-gold)', fontSize: '1.2rem' }}>
                    ✓
                  </div>
                )}
                
                <span style={{ fontSize: '4rem', marginBottom: '1rem', filter: isOwned ? 'drop-shadow(0 0 15px rgba(212,168,67,0.6))' : 'none' }}>
                  {badge.icon}
                </span>
                
                <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                  {badge.title}
                </h3>
                
                {badge.description && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {badge.description}
                  </p>
                )}

                <div style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {badge.cost} Points
                  </div>

                  {isSub && !isOwned && (
                    <button 
                      onClick={() => handleClaimBadge(badge)}
                      disabled={!canAfford}
                      className="wishlist__tribute-btn"
                      style={{ 
                        opacity: canAfford ? 1 : 0.5, 
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        width: '100%'
                      }}
                    >
                      {canAfford ? 'Claim Badge' : 'Not Enough Points'}
                    </button>
                  )}

                  {isSub && isOwned && (
                    <button 
                      disabled
                      className="wishlist__tribute-btn"
                      style={{ background: 'transparent', border: '1px solid var(--color-gold)', color: 'var(--color-gold)' }}
                    >
                      Owned
                    </button>
                  )}

                  {isGoddessOrDev && (
                    <button 
                      onClick={() => handleDeleteBadge(badge.id)}
                      style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        width: '100%',
                        marginTop: '0.5rem'
                      }}
                    >
                      Delete Badge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
