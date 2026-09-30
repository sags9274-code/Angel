import { useState, useRef } from 'react';
import { handleCheckout } from '../utils/checkout';

import handbagImg from '../assets/handbag.png';
import perfumeImg from '../assets/perfume.png';
import getawayImg from '../assets/getaway.png';
import diningImg from '../assets/dining.png';
import spaImg from '../assets/spa.png';
import jewelryImg from '../assets/jewelry.png';
import robeImg from '../assets/robe.png';
import cashImg from '../assets/cash.png';

const WISHLIST_ITEMS = [
  {
    id: 'designer-handbag',
    name: 'Designer Handbag',
    price: '$2,500',
    numericPrice: 2500,
    priority: 'High',
    image: handbagImg,
  },
  {
    id: 'luxury-perfume',
    name: 'Luxury Perfume',
    price: '$350',
    numericPrice: 350,
    priority: 'Medium',
    image: perfumeImg,
  },
  {
    id: 'weekend-getaway',
    name: 'Weekend Getaway',
    price: '$5,000',
    numericPrice: 5000,
    priority: 'High',
    image: getawayImg,
  },
  {
    id: 'fine-dining',
    name: 'Fine Dining',
    price: '$500',
    numericPrice: 500,
    priority: 'Medium',
    image: diningImg,
  },
  {
    id: 'spa-day',
    name: 'Spa Day',
    price: '$800',
    numericPrice: 800,
    priority: 'Low',
    image: spaImg,
  },
  {
    id: 'jewelry-set',
    name: 'Jewelry Set',
    price: '$1,200',
    numericPrice: 1200,
    priority: 'High',
    image: jewelryImg,
  },
  {
    id: 'silk-robe',
    name: 'Silk Robe',
    price: '$250',
    numericPrice: 250,
    priority: 'Low',
    image: robeImg,
  },
  {
    id: 'cash-tribute',
    name: 'Cash Tribute',
    price: '$100+',
    numericPrice: 100,
    priority: 'Medium',
    image: cashImg,
  },
];

export default function Wishlist() {
  const [customAmount, setCustomAmount] = useState('');

  const handleSendGift = (item) => {
    handleCheckout(`Gift: ${item.name}`, item.numericPrice);
  };

  const handleCustomTribute = (e) => {
    e.preventDefault();
    if (customAmount && !isNaN(customAmount) && Number(customAmount) > 0) {
      handleCheckout('Custom Tribute', Number(customAmount));
    } else {
      alert('Please enter a valid amount.');
    }
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
              <div
                className="wishlist__card-image-container"
                id={`wishlist-image-${item.id}`}
              >
                <img src={item.image} alt={item.name} className="wishlist__card-image" />
              </div>
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

        <form onSubmit={handleCustomTribute} style={{ textAlign: 'center', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: 'bold' }}>$</span>
              <input 
                type="number" 
                min="5"
                placeholder="100" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="wishlist__tribute-input" 
                style={{ paddingLeft: '35px', maxWidth: '200px' }}
                required
              />
            </div>
            <button 
              type="submit"
              className="wishlist__tribute-btn"
              style={{ display: 'inline-block', textDecoration: 'none', border: 'none', cursor: 'pointer' }}
            >
              Submit Payment
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
