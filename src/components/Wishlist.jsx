import { useState, useRef } from 'react';

const WISHLIST_ITEMS = [
  {
    id: 'designer-handbag',
    name: 'Designer Handbag',
    price: '$2,500',
    numericPrice: 2500,
    priority: 'High',
    emoji: '👜',
  },
  {
    id: 'luxury-perfume',
    name: 'Luxury Perfume',
    price: '$350',
    numericPrice: 350,
    priority: 'Medium',
    emoji: '✨',
  },
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    price: '$5,000',
    numericPrice: 5000,
    priority: 'High',
    emoji: '✈️',
  },
  {
    id: 'fine-dining',
    name: 'Fine Dining',
    price: '$500',
    numericPrice: 500,
    priority: 'Medium',
    emoji: '🍾',
  },
  {
    id: 'spa-day',
    name: 'Spa Day',
    price: '$800',
    numericPrice: 800,
    priority: 'Low',
    emoji: '🧖‍♀️',
  },
  {
    id: 'jewelry-set',
    name: 'Jewelry Set',
    price: '$1,200',
    numericPrice: 1200,
    priority: 'High',
    emoji: '💎',
  },
  {
    id: 'silk-robe',
    name: 'Silk Robe',
    price: '$250',
    numericPrice: 250,
    priority: 'Low',
    emoji: '👘',
  },
  {
    id: 'cash-tribute',
    name: 'Cash Tribute',
    price: '$100+',
    numericPrice: 100,
    priority: 'Medium',
    emoji: '💸',
  },
];

export default function Wishlist() {
  const handleSendGift = (item) => {
    window.open('https://ouish.co/tribute', '_blank');
  };

  return (
    <div className="page wishlist-page" id="wishlist-page">
      {/* Page Header */}
      <header className="page__header" id="wishlist-header">
        <h1 className="page__title" id="wishlist-title">
          Tribute &amp; Worship
        </h1>
        <p className="page__subtitle" id="wishlist-subtitle">
          Beg to spoil your Supreme Goddess. Only generous subs are acknowledged.
        </p>
      </header>

      {/* Grid of Wishlist Gift Cards */}
      <div className="wishlist__grid" id="wishlist-grid">
        {WISHLIST_ITEMS.map((item) => (
          <div
            key={item.id}
            className="wishlist__card"
            id={`wishlist-card-${item.id}`}
          >
            <div className="wishlist__card-header">
              <span
                className="wishlist__card-icon"
                id={`wishlist-icon-${item.id}`}
                aria-hidden="true"
              >
                {item.emoji}
              </span>
              <span
                className={`wishlist__card-priority wishlist__card-priority--${item.priority.toLowerCase()} wishlist__badge wishlist__badge--${item.priority.toLowerCase()}`}
                id={`wishlist-badge-${item.id}`}
              >
                {item.priority}
              </span>
            </div>

            <div
              className="wishlist__card-name"
              id={`wishlist-name-${item.id}`}
            >
              {item.name}
            </div>

            <div
              className="wishlist__card-price"
              id={`wishlist-price-${item.id}`}
            >
              {item.price}
            </div>

            <button
              type="button"
              className="wishlist__card-btn"
              id={`wishlist-send-btn-${item.id}`}
              onClick={() => handleSendGift(item)}
            >
              Offer to Buy
            </button>
          </div>
        ))}
      </div>

      {/* Tribute Section */}
      <section
        className="wishlist__tribute"
        id="wishlist-tribute"
      >
        <h2 className="wishlist__tribute-title" id="tribute-title">
          Beg to Pay a Custom Amount
        </h2>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a 
            href="https://ouish.co/tribute" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="wishlist__tribute-btn"
            style={{ display: 'inline-block', textDecoration: 'none' }}
          >
            Submit Payment
          </a>
        </div>
      </section>
    </div>
  );
}
