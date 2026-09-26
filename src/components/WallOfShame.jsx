import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Pre-populated sample entries with dark gradient backgrounds and shame-related emojis
const INITIAL_SHAME_ENTRIES = [
  {
    id: 'shame-1',
    file: null,
    preview: null,
    caption: 'PayPig Pete - Sent $50 thinking he was special',
    timestamp: '2 hours ago',
    tag: 'Delusional',
    emoji: '🤡',
    gradient: 'linear-gradient(135deg, #2b0808 0%, #160404 60%, #0d0202 100%)',
    minHeight: '220px',
  },
  {
    id: 'shame-2',
    file: null,
    preview: null,
    caption: 'Wallet Warrior - Begged for attention in DMs after 3 days of silence',
    timestamp: '5 hours ago',
    tag: 'Desperate',
    emoji: '💸',
    gradient: 'linear-gradient(135deg, #2a0c1a 0%, #17040d 60%, #0a0106 100%)',
    minHeight: '260px',
  },
  {
    id: 'shame-3',
    file: null,
    preview: null,
    caption: 'Simp Supreme - Maxed out his credit card for a "good morning" text',
    timestamp: 'Yesterday',
    tag: 'Bankrupt',
    emoji: '📉',
    gradient: 'linear-gradient(135deg, #200926 0%, #120317 60%, #08010a 100%)',
    minHeight: '200px',
  },
  {
    id: 'shame-4',
    file: null,
    preview: null,
    caption: 'DMs Desperado - Wrote a 14-paragraph apology essay for breathing her air',
    timestamp: '2 days ago',
    tag: 'Ignored Forever',
    emoji: '📜',
    gradient: 'linear-gradient(135deg, #280909 0%, #180303 60%, #0c0101 100%)',
    minHeight: '280px',
  },
  {
    id: 'shame-5',
    file: null,
    preview: null,
    caption: 'Tribute Traitor - Pledged eternal devotion, then asked for a discount code',
    timestamp: '3 days ago',
    tag: 'The Audacity',
    emoji: '🚫',
    gradient: 'linear-gradient(135deg, #2c1107 0%, #190802 60%, #0c0301 100%)',
    minHeight: '210px',
  },
  {
    id: 'shame-6',
    file: null,
    preview: null,
    caption: 'Silent Stalker - Watched every story 42 times without leaving a single tribute',
    timestamp: '5 days ago',
    tag: 'Blocked',
    emoji: '👁️',
    gradient: 'linear-gradient(135deg, #1b0922 0%, #100315 60%, #08010a 100%)',
    minHeight: '240px',
  },
];

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

export default function WallOfShame() {
  const [images, setImages] = useState(INITIAL_SHAME_ENTRIES);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const { role } = useAuth();
  const canEdit = role === 'goddess' || role === 'developer';

  const fileInputRef = useRef(null);

  // Validate and process the selected image file
  const processFile = (file) => {
    if (!file) return;

    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const isMimeValid = ACCEPTED_MIME_TYPES.includes(file.type);
    const isExtValid = ACCEPTED_EXTENSIONS.includes(fileExt);

    if (!isMimeValid && !isExtValid) {
      setErrorMsg(
        'Unsupported file format. Please upload .jpg, .jpeg, .png, .gif, or .webp images only.'
      );
      return;
    }

    // Clear previous errors
    setErrorMsg(null);
    setPendingFile(file);

    // Generate preview using FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingPreview(e.target?.result);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers with visual feedback
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFile(selectedFiles[0]);
    }
  };

  // Trigger file selection dialog
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset current pending upload
  const handleClearPending = () => {
    setPendingFile(null);
    setPendingPreview(null);
    setCaption('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Finalize upload and add to wall
  const handleAddToWall = (e) => {
    if (e) e.preventDefault();

    if (!pendingPreview && !pendingFile) {
      setErrorMsg('Please select or drop an image file first.');
      return;
    }

    const finalCaption = caption.trim() || 'Anonymous Offender - Caught in the act';
    const newEntry = {
      id: `shame-upload-${Date.now()}`,
      file: pendingFile,
      preview: pendingPreview,
      caption: finalCaption,
      timestamp: 'Just now',
      tag: 'Newly Exposed',
      emoji: '🥀',
      minHeight: '240px',
    };

    setImages((prev) => [newEntry, ...prev]);

    // Reset pending state
    handleClearPending();
  };

  const handleRemoveFromWall = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <div className="page wall-page" id="wall-of-shame-page">
      <div className="wall__container">
        {/* Page Header */}
        <header className="page__header wall__header">
          <div className="wall__header-badge">
            <span className="wall__header-badge-dot" />
            <span className="wall__header-badge-text">Public Disgrace Archive</span>
          </div>
          <h1 className="page__title wall__title" id="wall-title">
            Wall of Shame
          </h1>
          <p className="page__subtitle wall__subtitle" id="wall-subtitle">
            The fallen. The failures. Displayed for all to see.
          </p>
        </header>

        {/* Upload Zone */}
        {canEdit && (
        <section className="wall__upload-section" aria-label="Upload evidence">
          <div
            className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${
              pendingPreview ? 'upload-zone--has-preview' : ''
            }`}
            id="shame-upload-zone"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={!pendingPreview ? handleBrowseClick : undefined}
            role="region"
            aria-label="Evidence upload zone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="upload-zone__input"
              id="wall-file-input"
              style={{ display: 'none' }}
              aria-label="Upload offender screenshot"
            />

            {!pendingPreview ? (
              <div className="upload-zone__empty-state">
                <div className="upload-zone__icon-container">
                  <span className="upload-zone__icon-glow" />
                  <svg
                    className="upload-zone__icon"
                    viewBox="0 0 24 24"
                    width="40"
                    height="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>

                <h3 className="upload-zone__headline">
                  {isDragging ? 'Drop Offender Evidence Here' : 'Drag & Drop Offender Evidence'}
                </h3>
                <p className="upload-zone__description">
                  Drop screenshot here, or{' '}
                  <span className="upload-zone__browse-btn">browse your files</span>
                </p>
                <div className="upload-zone__badges">
                  <span className="upload-zone__badge">.JPG</span>
                  <span className="upload-zone__badge">.JPEG</span>
                  <span className="upload-zone__badge">.PNG</span>
                  <span className="upload-zone__badge">.GIF</span>
                  <span className="upload-zone__badge">.WEBP</span>
                </div>
              </div>
            ) : (
              <div
                className="upload-zone__active-state"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Preview Thumbnail */}
                <div className="upload-zone__preview-col">
                  <div className="upload-zone__thumb-frame">
                    <img
                      src={pendingPreview}
                      alt="Uploaded offender preview"
                      className="upload-zone__thumb-img"
                    />
                    <button
                      type="button"
                      className="upload-zone__remove-thumb"
                      onClick={handleClearPending}
                      aria-label="Remove image"
                      title="Remove image"
                    >
                      &times;
                    </button>
                    <span className="upload-zone__thumb-tag">Evidence Ready</span>
                  </div>
                  {pendingFile && (
                    <div className="upload-zone__thumb-meta">
                      <span className="upload-zone__thumb-name">{pendingFile.name}</span>
                      <span className="upload-zone__thumb-size">
                        {(pendingFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption Input & Action */}
                <div className="upload-zone__form-col">
                  <label htmlFor="shame-caption-input" className="upload-zone__form-label">
                    Add Offender Caption &amp; Name
                  </label>
                  <input
                    type="text"
                    id="shame-caption-input"
                    className="upload-zone__caption-input"
                    placeholder="e.g., PayPig Pete - Sent $50 thinking he was special"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddToWall();
                      }
                    }}
                    autoFocus
                  />
                  <p className="upload-zone__caption-hint">
                    State their name and offense clearly for the eternal record.
                  </p>

                  <div className="upload-zone__action-row">
                    <button
                      type="button"
                      className="upload-zone__submit-btn"
                      id="add-to-wall-btn"
                      onClick={handleAddToWall}
                    >
                      <span className="upload-zone__submit-text">Add to Wall</span>
                      <span className="upload-zone__submit-icon">⚡</span>
                    </button>
                    <button
                      type="button"
                      className="upload-zone__cancel-btn"
                      onClick={handleClearPending}
                    >
                      Discard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="upload-zone__error-banner" role="alert">
                <span className="upload-zone__error-icon">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </section>
        )}

        {/* Gallery Section */}
        <section className="wall__gallery-section" aria-label="Wall of Shame Gallery">
          <div className="wall__gallery-bar">
            <div className="wall__gallery-stats">
              <span className="wall__stat-count">{images.length}</span>
              <span className="wall__stat-label">Offenders Displayed</span>
            </div>
            <div className="wall__gallery-pill">
              <span className="wall__pill-dot" />
              <span>Permanent Public Record</span>
            </div>
          </div>

          {/* Masonry Columns Gallery */}
          <div className="wall__gallery" id="wall-gallery">
            {images.map((item) => (
              <article
                key={item.id}
                className="wall__card"
                id={`shame-card-${item.id}`}
              >
                {/* Image or Dark Gradient Placeholder */}
                {item.preview ? (
                  <div className="wall__card-media">
                    <img
                      src={item.preview}
                      alt={item.caption}
                      className="wall__card-img"
                      loading="lazy"
                    />
                    <div className="wall__card-gradient-overlay" />
                    <span className="wall__card-badge wall__card-badge--exposed">
                      {item.tag || 'Exposed'}
                    </span>
                    {canEdit && (
                      <button className="wall__card-delete" onClick={() => handleRemoveFromWall(item.id)} title="Remove Offender">×</button>
                    )}
                  </div>
                ) : (
                  <div
                    className="wall__card-placeholder"
                    style={{
                      background: item.gradient || 'linear-gradient(135deg, #2b0808 0%, #150303 60%, #0a0101 100%)',
                      minHeight: item.minHeight || '220px',
                    }}
                  >
                    <div className="wall__placeholder-overlay" />
                    <span className="wall__placeholder-emoji" role="img" aria-label="Shame icon">
                      {item.emoji || '💀'}
                    </span>
                    {item.tag && (
                      <span className="wall__card-badge">{item.tag}</span>
                    )}
                    {canEdit && (
                      <button className="wall__card-delete" onClick={() => handleRemoveFromWall(item.id)} title="Remove Offender">×</button>
                    )}
                  </div>
                )}

                {/* Card Content */}
                <div className="wall__card-body">
                  <p className="wall__card-caption">{item.caption}</p>
                  <div className="wall__card-footer">
                    <span className="wall__card-timestamp">
                      <svg
                        className="wall__card-clock-icon"
                        viewBox="0 0 24 24"
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {item.timestamp}
                    </span>
                    <span className="wall__card-verdict">SHAMED</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
