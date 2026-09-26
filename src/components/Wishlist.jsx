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
  const [tributeAmount, setTributeAmount] = useState('');
  const [tributeMessage, setTributeMessage] = useState('');
  const [submittedStatus, setSubmittedStatus] = useState(null);

  const tributeRef = useRef(null);

  const handleSendGift = (item) => {
    setTributeAmount(item.numericPrice.toString());
    setTributeMessage(`Tribute offering for ${item.name} (${item.price})`);
    setSubmittedStatus(null);

    if (tributeRef.current) {
      tributeRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleTributeSubmit = (e) => {
    e.preventDefault();
    if (!tributeAmount || Number(tributeAmount) <= 0) return;

    setSubmittedStatus({
      amount: tributeAmount,
      message: tributeMessage,
    });
  };

  const handleReset = () => {
    setTributeAmount('');
    setTributeMessage('');
    setSubmittedStatus(null);
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
        ref={tributeRef}
      >
        <h2 className="wishlist__tribute-title" id="tribute-title">
          Beg to Pay a Custom Amount
        </h2>

        {submittedStatus ? (
          <div
            className="wishlist__tribute-success"
            id="tribute-success"
          >
            <p className="wishlist__tribute-success-title">
              Tribute Received
            </p>
            <p className="wishlist__tribute-success-text">
              Your tribute of{' '}
              <strong className="wishlist__tribute-success-amount">
                ${Number(submittedStatus.amount).toLocaleString()}
              </strong>{' '}
              has been presented to your Goddess.
            </p>
            {submittedStatus.message && (
              <p className="wishlist__tribute-success-note">
                &ldquo;{submittedStatus.message}&rdquo;
              </p>
            )}
            <button
              type="button"
              className="wishlist__tribute-btn"
              id="tribute-reset-btn"
              onClick={handleReset}
            >
              Send Another Tribute
            </button>
          </div>
        ) : (
          <form
            className="wishlist__tribute-form"
            id="tribute-form"
            onSubmit={handleTributeSubmit}
          >
            <div className="wishlist__tribute-amount-wrapper">
              <span
                className="wishlist__tribute-currency"
                id="tribute-currency-prefix"
                aria-hidden="true"
              >
                $
              </span>
              <input
                type="number"
                id="tribute-amount"
                name="tributeAmount"
                className="wishlist__tribute-input"
                placeholder="Amount"
                min="1"
                step="any"
                value={tributeAmount}
                onChange={(e) => setTributeAmount(e.target.value)}
                required
              />
            </div>

            <textarea
              id="tribute-message"
              name="tributeMessage"
              className="wishlist__tribute-message"
              placeholder="Optional message for your Goddess..."
              rows={3}
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <button
              type="submit"
              className="wishlist__tribute-btn"
              id="tribute-submit-btn"
            >
              Submit Payment
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
