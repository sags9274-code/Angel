import angelHero from '../assets/angel-hero.jpeg';
import angelProfile from '../assets/angel-profile.jpeg';
import ProfileCard from './ProfileCard';

export default function Hero() {
  return (
    <section className="hero" id="hero-section">
      {/* Background */}
      <div className="hero__bg">
        <img
          src={angelHero}
          alt=""
          className="hero__bg-image"
          loading="eager"
        />
        <div className="hero__bg-overlay" />
        <div className="hero__bg-vignette" />
      </div>

      {/* Content Grid */}
      <div className="hero__content">
        {/* Left Column */}
        <div className="hero__left">
          {/* Verified Badge */}
          <div className="hero__badge" id="hero-badge">
            <span className="hero__badge-dot" />
            <span className="hero__badge-text">Verified Creator & Tastemaker</span>
            <span className="hero__badge-check">✦</span>
          </div>

          {/* Main Heading */}
          <div className="hero__heading">
            <h1 className="hero__heading-line1">Hi I&apos;m Angel.</h1>
            <p className="hero__heading-line2">I&apos;ll ruin you loser.</p>
          </div>

          {/* Subtext */}
          <p className="hero__subtext">
            You&apos;ll be edged, ruined and be left aching for more.
          </p>

          {/* CTA Buttons */}
          <div className="hero__ctas">
            <button className="hero__cta-primary" id="cta-vip" onClick={() => window.open('https://ouish.co/tribute', '_blank')}>
              <span className="hero__cta-icon">✦</span>
              Submit to My VIP Tier
            </button>
            <button className="hero__cta-secondary" id="cta-tribute" onClick={() => window.open('https://ouish.co/tribute', '_blank')}>
              <span className="hero__cta-icon">🎁</span>
              Offer Immediate Tribute
            </button>
          </div>

          {/* Stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">Total Devotion</span>
              <span className="hero__stat-label">Surrender Now</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">&lt; 5m</span>
              <span className="hero__stat-label">Brutal Responses</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">Elite Tier</span>
              <span className="hero__stat-label">Premium Goddess</span>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Card */}
        <div className="hero__right">
          <ProfileCard />
        </div>
      </div>
    </section>
  );
}
