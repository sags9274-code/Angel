import { useState } from 'react';
import './PaymentModal.css';

export default function PaymentModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const bankDetails = [
    { label: 'Account Name', value: 'goddess Angel' },
    { label: 'Account Number', value: '212376538794' },
    { label: 'Wire Routing', value: '101019644' },
    { label: 'ACH Routing', value: '101019644' },
    { label: 'Account Type', value: 'Checking' },
    { label: 'Bank Name', value: 'Lead' },
    { label: 'Bank Address', value: '1801 Main St., Kansas City, MO 64108' },
  ];

  const handleCopy = (text, fieldLabel) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldLabel);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="payment-modal__overlay" onClick={onClose}>
      <div className="payment-modal__content premium-frame" onClick={e => e.stopPropagation()}>
        <button className="payment-modal__close" onClick={onClose}>&times;</button>
        <h2 className="payment-modal__title">Direct Bank Transfer</h2>
        <p className="payment-modal__subtitle">Submit your tribute directly to your Goddess.</p>
        
        <div className="payment-modal__details">
          {bankDetails.map((detail, index) => (
            <div key={index} className="payment-modal__field">
              <span className="payment-modal__label">{detail.label}</span>
              <div className="payment-modal__value-container">
                <span className="payment-modal__value">{detail.value}</span>
                <button 
                  className="payment-modal__copy-btn"
                  onClick={() => handleCopy(detail.value, detail.label)}
                >
                  {copiedField === detail.label ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
