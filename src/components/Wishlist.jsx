import './Wishlist.css';
import mikkyImage from '../assets/mikky.jpeg';
import { X, MoreHorizontal, Link as LinkIcon } from 'lucide-react';

export default function Wishlist() {
  const links = [
    {
      id: 1,
      title: 'www.g2a.com',
      url: 'https://www.g2a.com',
      hasAvatar: false,
    },
    {
      id: 2,
      title: 'Goddess mikky✨',
      url: '#',
      hasAvatar: true,
    }
  ];

  return (
    <div className="linktree-container">
      {/* Background SVG pattern to mimic the wavy camouflage */}
      <div className="linktree-bg">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" opacity="0.6">
          <defs>
            <pattern id="wavy" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M0 30 Q30 0 60 30 T120 30 L120 120 L0 120 Z" fill="rgba(255,255,255,0.05)"/>
              <path d="M0 60 Q30 30 60 60 T120 60 L120 120 L0 120 Z" fill="rgba(255,255,255,0.08)"/>
              <path d="M0 90 Q30 60 60 90 T120 90 L120 120 L0 120 Z" fill="rgba(255,255,255,0.1)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wavy)" />
        </svg>
      </div>

      <div className="linktree-content">
        <div className="linktree-header">
          <div className="linktree-avatar-wrapper">
            <img src={mikkyImage} alt="Goddess Mikky" className="linktree-avatar" />
          </div>
          <h1 className="linktree-title">Goddess mikky</h1>
          <p className="linktree-subtitle">Making men weak 😈 🤭</p>
          
          <div className="linktree-socials">
            <a href="https://twitter.com/goddessmikky23" target="_blank" rel="noopener noreferrer" className="linktree-social-link">
              <X size={24} color="white" />
            </a>
          </div>
        </div>

        <div className="linktree-links">
          {links.map((link) => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="linktree-link-card">
              {link.hasAvatar ? (
                <img src={mikkyImage} alt="Icon" className="linktree-link-avatar" />
              ) : (
                <div className="linktree-link-placeholder"></div>
              )}
              <span className="linktree-link-text">{link.title}</span>
              <div className="linktree-link-more">
                <MoreHorizontal size={18} color="white" />
              </div>
            </a>
          ))}
        </div>

        <div className="linktree-footer">
          <a href="#" className="linktree-join-btn">
            Join goddessmikky23 on Linktree
          </a>
        </div>
      </div>
    </div>
  );
}
