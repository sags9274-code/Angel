import { useState, useRef } from 'react';

const CONTRACT_TYPES = [
  'Servitude Agreement',
  'Financial Domination',
  'Obedience Contract',
  'Custom Terms',
];

const ACCEPTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt'];

export default function Contracts() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contractType, setContractType] = useState(CONTRACT_TYPES[0]);
  const [terms, setTerms] = useState('');
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Format file size nicely
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Check valid file extension
  const isValidFileType = (filename) => {
    const lower = filename.toLowerCase();
    return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  };

  // Process and store incoming files in state
  const handleAddFiles = (incomingFileList) => {
    setErrorMessage('');
    const validFiles = [];
    const rejectedFiles = [];

    Array.from(incomingFileList).forEach((file) => {
      if (isValidFileType(file.name)) {
        // Prevent duplicate files by name and size
        const isDuplicate = files.some(
          (existing) => existing.name === file.name && existing.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push({
            id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
            name: file.name,
            size: file.size,
            file,
          });
        }
      } else {
        rejectedFiles.push(file.name);
      }
    });

    if (rejectedFiles.length > 0) {
      setErrorMessage(
        `Unsupported format: ${rejectedFiles.join(', ')}. Please upload only .pdf, .doc, .docx, or .txt files.`
      );
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitted(true);
  };

  return (
    <div className="page contracts-page" id="contracts-page">
      {/* Page Header */}
      <header className="page__header" id="contracts-header">
        <h1 className="page__title" id="contracts-title">
          Contracts
        </h1>
        <p className="page__subtitle" id="contracts-subtitle">
          Submit your binding agreements and serve with devotion
        </p>
      </header>

      {/* Submission Success Banner */}
      {submitted && (
        <div className="contracts__success" id="contracts-success-banner" role="status">
          <span>✦ Contract submitted successfully. Your agreement is bound in devotion.</span>
          <button
            type="button"
            className="contracts__file-remove"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSubmitted(false)}
            aria-label="Dismiss message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Contract Form */}
      <form className="contracts__form" id="contracts-form" onSubmit={handleSubmit}>
        {/* Name & Email Row */}
        <div className="contracts__row">
          <div className="contracts__field">
            <label className="contracts__label" htmlFor="contract-name">
              Name
            </label>
            <input
              type="text"
              id="contract-name"
              name="name"
              className="contracts__input"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className="contracts__field">
            <label className="contracts__label" htmlFor="contract-email">
              Email
            </label>
            <input
              type="email"
              id="contract-email"
              name="email"
              className="contracts__input"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Contract Type Dropdown */}
        <div className="contracts__field">
          <label className="contracts__label" htmlFor="contract-type">
            Contract Type
          </label>
          <select
            id="contract-type"
            name="contractType"
            className="contracts__select"
            value={contractType}
            onChange={(e) => setContractType(e.target.value)}
          >
            {CONTRACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Terms / Notes Textarea */}
        <div className="contracts__field">
          <label className="contracts__label" htmlFor="contract-terms">
            Terms/Notes
          </label>
          <textarea
            id="contract-terms"
            name="terms"
            className="contracts__textarea"
            placeholder="Specify your terms, conditions, or servitude notes..."
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={5}
          />
        </div>

        {/* File Upload Zone */}
        <div className="contracts__field">
          <label className="contracts__label">Supporting Documents</label>
          <div
            className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
            id="contract-upload-zone"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload contract documents"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              id="contract-file-input"
              tabIndex={-1}
              aria-hidden="true"
            />
            <span className="upload-zone__icon" aria-hidden="true">
              📄
            </span>
            <div className="upload-zone__text">Drop your files here, or browse</div>
            <div className="upload-zone__hint">Supports .pdf, .doc, .docx, .txt</div>
          </div>

          {/* Validation Error Message */}
          {errorMessage && (
            <div className="contracts__error" id="contracts-error-message" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Uploaded File List */}
          {files.length > 0 && (
            <div className="contracts__files" id="contracts-file-list">
              {files.map((file, index) => (
                <div
                  className="contracts__file"
                  key={file.id || index}
                  id={`contract-file-${index}`}
                >
                  <div className="contracts__file-info">
                    <span className="contracts__file-icon" aria-hidden="true">
                      📎
                    </span>
                    <span className="contracts__file-name">{file.name}</span>
                    <span className="contracts__file-size">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="contracts__file-remove"
                    id={`contract-file-remove-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file.id);
                    }}
                    aria-label={`Remove file ${file.name}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="contracts__submit contracts__submit-btn"
            id="contracts-submit-btn"
          >
            Submit Contract
          </button>
        </div>
      </form>
    </div>
  );
}
