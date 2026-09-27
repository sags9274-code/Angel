import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];
const ACCEPTED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
];

export default function WallOfShame() {
  const [images, setImages] = useState([]);
  
  // Multi-upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('Exposed');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Comments state
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const { role, user } = useAuth();
  const canEdit = role === 'goddess' || role === 'developer';

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchWallOfShame();
  }, []);

  const fetchWallOfShame = async () => {
    setLoading(true);
    const { data: posts, error: postsError } = await supabase
      .from('wall_of_shame')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching wall of shame:', postsError);
      setLoading(false);
      return;
    }
    
    setImages(posts || []);
    
    if (posts && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: commentsData, error: commentsError } = await supabase
        .from('shame_comments')
        .select(`
          id, shame_id, comment_text, created_at, user_id,
          profiles (role, email)
        `)
        .in('shame_id', postIds)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
      } else {
        const grouped = {};
        postIds.forEach(id => grouped[id] = []);
        commentsData?.forEach(c => {
          grouped[c.shame_id].push({
            id: c.id,
            text: c.comment_text,
            userId: c.user_id,
            role: c.profiles?.role || 'sub',
            email: c.profiles?.email?.split('@')[0] || 'Anonymous',
            date: new Date(c.created_at).toLocaleDateString()
          });
        });
        
        Object.keys(grouped).forEach(key => {
          grouped[key].sort((a, b) => {
            if (a.role === 'goddess' && b.role !== 'goddess') return -1;
            if (b.role === 'goddess' && a.role !== 'goddess') return 1;
            return 0;
          });
        });
        
        setComments(grouped);
      }
    }
    setLoading(false);
  };

  const processFiles = (files) => {
    if (!files || files.length === 0) return;

    const validFiles = [];
    const validPreviews = [];
    let hasError = false;

    Array.from(files).forEach((file) => {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const isMimeValid = ACCEPTED_MIME_TYPES.includes(file.type);
      const isExtValid = ACCEPTED_EXTENSIONS.includes(fileExt);

      if (!isMimeValid && !isExtValid) {
        hasError = true;
      } else {
        validFiles.push(file);
        
        // Use URL.createObjectURL for synchronous preview generation
        validPreviews.push({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }
    });

    if (hasError) {
      setErrorMsg('Some files were ignored. Only images and videos (.mp4, .webm, .mov) are allowed.');
    } else {
      setErrorMsg(null);
    }

    setPendingFiles(prev => [...prev, ...validFiles]);
    setPendingPreviews(prev => [...prev, ...validPreviews]);
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
    processFiles(e.dataTransfer?.files);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRemovePreview = (index) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
    setPendingPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearPending = () => {
    setPendingFiles([]);
    setPendingPreviews([]);
    setCaption('');
    setTag('Exposed');
    setErrorMsg(null);
    setIsUploadOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddToWall = async (e) => {
    if (e) e.preventDefault();

    if (pendingFiles.length === 0) {
      setErrorMsg('Please select at least one image or video.');
      return;
    }

    const finalCaption = caption.trim() || 'Anonymous Offender - Caught in the act';
    const finalTag = tag.trim() || 'Exposed';
    
    // Upload all files to storage
    const uploadedUrls = [];
    
    for (const file of pendingFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('shame_images')
        .upload(fileName, file);
        
      if (uploadError) {
        setErrorMsg('Failed to upload a file: ' + uploadError.message);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('shame_images')
        .getPublicUrl(fileName);
        
      uploadedUrls.push(urlData.publicUrl);
    }
      
    // Insert into DB
    const { error: dbError } = await supabase
      .from('wall_of_shame')
      .insert([{ 
        media_urls: uploadedUrls, 
        caption: finalCaption, 
        tag: finalTag 
      }]);
      
    if (dbError) {
      setErrorMsg('Failed to save entry: ' + dbError.message);
      return;
    }
    
    handleClearPending();
    fetchWallOfShame();
  };

  const handleRemoveFromWall = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offender?")) return;
    const { error } = await supabase.from('wall_of_shame').delete().eq('id', id);
    if (error) alert("Failed to delete: " + error.message);
    else fetchWallOfShame();
  };
  
  const handlePostComment = async (shameId) => {
    const text = newComment[shameId]?.trim();
    if (!text || !user) return;
    
    const { error } = await supabase
      .from('shame_comments')
      .insert([{ shame_id: shameId, user_id: user.id, comment_text: text }]);
      
    if (error) {
      alert("Failed to post comment: " + error.message);
    } else {
      setNewComment({ ...newComment, [shameId]: '' });
      fetchWallOfShame();
    }
  };

  const renderMedia = (urls, fallbackUrl) => {
    // Determine active URLs (new array format or legacy fallback)
    let activeUrls = [];
    if (urls && urls.length > 0) activeUrls = urls;
    else if (fallbackUrl) activeUrls = [fallbackUrl];
    
    if (activeUrls.length === 0) return null;

    if (activeUrls.length === 1) {
      const url = activeUrls[0];
      const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
      return isVideo ? (
        <video src={url} controls className="wall__card-media-item" />
      ) : (
        <img src={url} alt="Offender evidence" className="wall__card-media-item" loading="lazy" />
      );
    }

    return (
      <div className="wall__card-carousel">
        {activeUrls.map((url, i) => {
          const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
          return (
            <div key={i} className="wall__card-carousel-slide">
              {isVideo ? (
                <video src={url} controls className="wall__card-media-item" />
              ) : (
                <img src={url} alt={`Evidence ${i+1}`} className="wall__card-media-item" loading="lazy" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page wall-page" id="wall-of-shame-page">
      <div className="wall__container">
        <header className="page__header wall__header">
          <div className="wall__header-badge">
            <span className="wall__header-badge-dot" />
            <span className="wall__header-badge-text">Public Disgrace Archive</span>
          </div>
          <h1 className="page__title wall__title" id="wall-title">Wall of Shame</h1>
          <p className="page__subtitle wall__subtitle" id="wall-subtitle">
            The fallen. The failures. Displayed for all to see.
          </p>
        </header>

        {canEdit && (
          <div className="wall__admin-controls">
            {!isUploadOpen ? (
              <button className="wall__add-btn" onClick={() => setIsUploadOpen(true)}>
                + Add New Offender
              </button>
            ) : (
              <section className="wall__upload-section wall__upload-section--open">
                <div
                  className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={pendingPreviews.length === 0 ? handleBrowseClick : undefined}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="upload-zone__input"
                    style={{ display: 'none' }}
                  />

                  {pendingPreviews.length === 0 ? (
                    <div className="upload-zone__empty-state">
                      <div className="upload-zone__icon-container">
                        <span style={{fontSize: '2rem'}}>📸🎥</span>
                      </div>
                      <h3 className="upload-zone__headline">
                        {isDragging ? 'Drop Photos/Videos Here' : 'Drag & Drop Photos and Videos'}
                      </h3>
                      <p className="upload-zone__description">
                        Drop media here, or <span className="upload-zone__browse-btn">browse files</span>
                      </p>
                    </div>
                  ) : (
                    <div className="upload-zone__active-state" onClick={(e) => e.stopPropagation()}>
                      <div className="upload-zone__multi-preview">
                        {pendingPreviews.map((p, i) => (
                          <div key={i} className="upload-zone__thumb-frame-multi">
                            {p.type === 'video' ? (
                              <video src={p.url} className="upload-zone__thumb-img" />
                            ) : (
                              <img src={p.url} alt="Preview" className="upload-zone__thumb-img" />
                            )}
                            <button type="button" className="upload-zone__remove-thumb" onClick={() => handleRemovePreview(i)}>&times;</button>
                          </div>
                        ))}
                        <button className="upload-zone__add-more" onClick={handleBrowseClick}>+</button>
                      </div>

                      <div className="upload-zone__form-col">
                        <input
                          type="text"
                          className="upload-zone__caption-input"
                          placeholder="Offender Name & Description..."
                          value={caption}
                          onChange={(e) => setCaption(e.target.value)}
                          style={{marginBottom: '10px'}}
                        />
                        <input
                          type="text"
                          className="upload-zone__caption-input"
                          placeholder="Tag (e.g., Exposed, Bankrupt)"
                          value={tag}
                          onChange={(e) => setTag(e.target.value)}
                        />
                        <div className="upload-zone__action-row" style={{marginTop: '15px'}}>
                          <button type="button" className="upload-zone__submit-btn" onClick={handleAddToWall}>
                            <span className="upload-zone__submit-text">Post Offender</span>
                          </button>
                          <button type="button" className="upload-zone__cancel-btn" onClick={handleClearPending}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="upload-zone__error-banner"><span>⚠️ {errorMsg}</span></div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        <section className="wall__gallery-section">
          {loading ? (
            <p style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>Loading offenders...</p>
          ) : images.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>No offenders found yet. The wall is clean.</p>
          ) : (
            <div className="wall__gallery" id="wall-gallery">
              {images.map((item) => (
                <article key={item.id} className="wall__card">
                  <div className="wall__card-media-container">
                    {renderMedia(item.media_urls, item.image_url)}
                    <span className="wall__card-badge wall__card-badge--exposed">
                      {item.tag || 'Exposed'}
                    </span>
                    {canEdit && (
                      <button className="wall__card-delete" onClick={() => handleRemoveFromWall(item.id)}>×</button>
                    )}
                  </div>
                  
                  <div className="wall__card-body">
                    <p className="wall__card-caption">{item.caption}</p>
                    <div className="wall__card-footer">
                      <span className="wall__card-timestamp">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="wall__comments-section">
                    <div className="wall__comments-list">
                      {comments[item.id]?.length > 0 ? (
                        comments[item.id].map(c => (
                          <div key={c.id} className={`wall__comment ${c.role === 'goddess' ? 'wall__comment--goddess' : ''}`}>
                            <div className="wall__comment-header">
                              <span className="wall__comment-author">
                                {c.role === 'goddess' ? '👑 Goddess' : c.email}
                              </span>
                              <span className="wall__comment-date">{c.date}</span>
                            </div>
                            <p className="wall__comment-text">{c.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="wall__comment-empty">No comments yet. Roast them!</p>
                      )}
                    </div>
                    
                    {user ? (
                      <div className="wall__comment-input-row">
                        <input
                          type="text"
                          placeholder="Laugh at them..."
                          className="wall__comment-input"
                          value={newComment[item.id] || ''}
                          onChange={(e) => setNewComment({...newComment, [item.id]: e.target.value})}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePostComment(item.id);
                          }}
                        />
                        <button className="wall__comment-btn" onClick={() => handlePostComment(item.id)}>Post</button>
                      </div>
                    ) : (
                      <p className="wall__comment-empty" style={{textAlign:'center', marginTop: '10px'}}>Sign in to comment.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
