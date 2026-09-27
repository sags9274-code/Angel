import profileImage from '../assets/mikky.jpeg';

export default function ProfileCard() {
  return (
    <div className="profile-card premium-frame" id="profile-card">
      {/* Top Badge */}
      <span className="profile-card__badge">Supreme Owner</span>

      {/* Profile Image */}
      <div className="profile-card__image-wrapper">
        <img
          src={profileImage}
          alt="Mikky - Creator & Tastemaker"
          className="profile-card__image"
          loading="eager"
        />
        <div className="profile-card__gradient" />
      </div>

      {/* Info Overlay */}
      <div className="profile-card__info">
        <div className="profile-card__info-text">
          <span className="profile-card__label">BOW TO YOUR GODDESS</span>
          <span className="profile-card__name">Mikky</span>
        </div>
        <div className="profile-card__status">
          <div className="profile-card__status-dot profile-card__status-dot--active" />
          <div className="profile-card__status-dot" />
        </div>
      </div>
    </div>
  );
}
