import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const CONTRACT_TYPES = [
  'Servitude Agreement',
  'Financial Domination',
  'Obedience Contract',
  'Custom Terms',
];

const ACCEPTED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'webp'];
const ACCEPTED_MIME_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg', 'image/png', 'image/webp'
];

export default function Contracts() {
  const { user, role } = useAuth();
  const isGoddessOrDev = role === 'goddess' || role === 'developer';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  
  // File Upload State
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContracts();
  }, [user]);

  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching contracts:", error);
    } else {
      setContracts(data || []);
    }
    setLoading(false);
  };

  // Format file size nicely
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Process and store incoming files in state
  const handleAddFiles = (incomingFileList) => {
    setErrorMessage('');
    const validFiles = [];
    let hasError = false;

    Array.from(incomingFileList).forEach((file) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isMimeValid = ACCEPTED_MIME_TYPES.includes(file.type);
      const isExtValid = ACCEPTED_EXTENSIONS.includes(fileExt);

      if (!isMimeValid && !isExtValid) {
        hasError = true;
      } else if (file.size > 10 * 1024 * 1024) {
        hasError = true; // Size limit 10MB
      } else {
        // Prevent duplicate files by name and size
        const isDuplicate = pendingFiles.some(
          (existing) => existing.name === file.name && existing.size === file.size
        );
        if (!isDuplicate) {
          validFiles.push(file);
        }
      }
    });

    if (hasError) {
      setErrorMessage('Some files were ignored. Supported: PDF, Word, TXT, Images (Max 10MB).');
    }

    if (validFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...validFiles]);
    }
  };

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

  const handleRemoveFile = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || pendingFiles.length === 0) {
      setErrorMessage("Name and at least one document are required.");
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);

    const uploadedUrls = [];
    
    // Upload files
    for (const file of pendingFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contract_documents')
        .upload(fileName, file);
        
      if (uploadError) {
        setErrorMessage('Failed to upload a document: ' + uploadError.message);
        setIsSubmitting(false);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('contract_documents')
        .getPublicUrl(fileName);
        
      uploadedUrls.push(urlData.publicUrl);
    }

    // Insert DB record
    const { data, error } = await supabase
      .from('contracts')
      .insert([{
        name,
        contract_type: 'Standard',
        file_urls: uploadedUrls
      }])
      .select()
      .single();

    if (error) {
      setErrorMessage('Failed to save contract record.');
    } else {
      setContracts([data, ...contracts]);
      // Reset form
      setName('');
      setPendingFiles([]);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm("Delete this contract permanently?")) return;

    // Ideally, we should also delete the files from storage here,
    // but for simplicity we'll just delete the DB record.
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting contract.");
    } else {
      setContracts(contracts.filter(c => c.id !== id));
    }
  };

  return (
    <div className="page contracts-page" id="contracts-page">
      <header className="page__header" id="contracts-header">
        <h1 className="page__title" id="contracts-title">
          Contracts
        </h1>
        <p className="page__subtitle" id="contracts-subtitle">
          Submit your binding agreements and serve with devotion
        </p>
      </header>

      {/* Contract Form - Goddess/Dev Only */}
      {isGoddessOrDev && (
        <form className="contracts__form" id="contracts-form" onSubmit={handleSubmit} style={{ marginBottom: '4rem' }}>
          <h2 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Create New Contract</h2>
          
          <div className="contracts__field">
            <label className="contracts__label" htmlFor="contract-name">Contract Name</label>
            <input
              type="text"
              id="contract-name"
              className="contracts__input"
              placeholder="e.g. Servitude Agreement"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="contracts__field">
            <label className="contracts__label">Supporting Documents</label>
            <div
              className={`upload-zone ${isDragging ? 'upload-zone--active' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload contract documents"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              <span className="upload-zone__icon" aria-hidden="true">📄</span>
              <div className="upload-zone__text">Drop your files here, or browse</div>
              <div className="upload-zone__hint">Supports PDF, Word, TXT, Images (Max 10MB)</div>
            </div>

            {errorMessage && (
              <div className="contracts__error" role="alert" style={{ marginTop: '1rem' }}>
                {errorMessage}
              </div>
            )}

            {pendingFiles.length > 0 && (
              <div className="contracts__files" style={{ marginTop: '1rem' }}>
                {pendingFiles.map((file, index) => (
                  <div className="contracts__file" key={index}>
                    <div className="contracts__file-info">
                      <span className="contracts__file-icon" aria-hidden="true">📎</span>
                      <span className="contracts__file-name">{file.name}</span>
                      <span className="contracts__file-size">({formatFileSize(file.size)})</span>
                    </div>
                    <button
                      type="button"
                      className="contracts__file-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(index);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button type="submit" className="contracts__submit contracts__submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Uploading & Creating...' : 'Publish Contract'}
            </button>
          </div>
        </form>
      )}

      {/* Contract List - Visible to Everyone (Subs can view) */}
      <section className="contracts__list-section">
        <h2 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', textAlign: 'center' }}>Active Contracts</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading contracts...</p>
        ) : contracts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No contracts have been published yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            {contracts.map(contract => (
              <div key={contract.id} style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', position: 'relative' }}>
                
                {isGoddessOrDev && (
                  <button 
                    onClick={() => handleDeleteContract(contract.id)}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-accent)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                )}

                <h3 style={{ color: 'var(--color-gold)', fontSize: '1.3rem', marginBottom: '0.5rem', paddingRight: '4rem' }}>
                  {contract.contract_type} - {contract.name}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Date: {new Date(contract.created_at).toLocaleDateString()}
                  {contract.email && ` | Email: ${contract.email}`}
                </p>

                {contract.terms && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>
                    {contract.terms}
                  </div>
                )}

                {contract.file_urls && contract.file_urls.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {contract.file_urls.map((url, i) => {
                      const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
                      const filename = url.split('/').pop().split('?')[0];
                      return (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-gold)',
                            borderRadius: '2rem',
                            color: 'var(--color-text-primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-gold)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = 'var(--color-bg-secondary)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
                        >
                          {isImage ? '🖼️' : '📄'} Document {i+1}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
