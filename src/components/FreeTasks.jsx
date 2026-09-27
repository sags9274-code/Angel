import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov'];
const ACCEPTED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
];

export default function FreeTasks() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState([]);
  const [completedTaskIds, setCompletedTaskIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Form State for Goddess/Dev
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDifficulty, setNewTaskDifficulty] = useState('Easy');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Proof Submission State (Subs)
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);
  const [proofText, setProofText] = useState('');
  
  // Multi-upload state for Subs
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const fileInputRef = useRef(null);

  // Proof Viewing State (Goddess/Dev)
  const [viewingProofsForTask, setViewingProofsForTask] = useState(null);
  const [proofsList, setProofsList] = useState([]);
  const [isLoadingProofs, setIsLoadingProofs] = useState(false);

  const isGoddessOrDev = role === 'goddess' || role === 'developer';
  const isSub = role === 'sub';

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    
    // 1. Fetch all tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    } else {
      setTasks(tasksData || []);
    }

    // 2. If sub, fetch completed tasks
    if (user && isSub) {
      const { data: completions, error: compError } = await supabase
        .from('task_completions')
        .select('task_id')
        .eq('user_id', user.id);

      if (compError) {
        console.error('Error fetching completions:', compError);
      } else if (completions) {
        const ids = new Set(completions.map(c => c.task_id));
        setCompletedTaskIds(ids);
      }
    }

    setLoading(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle || !newTaskTime) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          title: newTaskTitle,
          difficulty: newTaskDifficulty,
          time_estimate: newTaskTime,
          points: parseInt(newTaskPoints, 10),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Check console.');
    } else if (data) {
      setTasks([...tasks, data]);
      setNewTaskTitle('');
      setNewTaskTime('');
      setNewTaskPoints(10);
    }
    
    setIsSubmitting(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task.');
    } else {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // Sub clicks a task to open the submission modal
  const handleTaskClick = (task) => {
    if (!isSub || completedTaskIds.has(task.id)) return;
    setSelectedTaskForProof(task);
    setProofText('');
    setPendingFiles([]);
    setPendingPreviews([]);
    setErrorMsg(null);
  };

  // Multi-file drag and drop logic
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
      } else if (file.size > 50 * 1024 * 1024) {
        hasError = true; // Size limit 50MB
      } else {
        validFiles.push(file);
        validPreviews.push({
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }
    });

    if (hasError) {
      setErrorMsg('Some files were ignored. Only images and videos (.mp4, .webm, .mov) up to 50MB are allowed.');
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


  // Sub submits their proof
  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!proofText && pendingFiles.length === 0) {
      alert("You must submit either text or a file to prove your worth.");
      return;
    }

    setIsUploadingProof(true);
    
    // Upload all files to storage
    const uploadedUrls = [];
    
    if (pendingFiles.length > 0) {
      for (const file of pendingFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('task_proofs')
          .upload(fileName, file);
          
        if (uploadError) {
          setErrorMsg('Failed to upload a file: ' + uploadError.message);
          setIsUploadingProof(false);
          return;
        }
        
        const { data: urlData } = supabase.storage
          .from('task_proofs')
          .getPublicUrl(fileName);
          
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    // Insert into task_completions
    const { error } = await supabase
      .from('task_completions')
      .insert([{ 
        task_id: selectedTaskForProof.id, 
        user_id: user.id,
        proof_text: proofText || null,
        proof_media_urls: uploadedUrls
      }]);

    if (error) {
      console.error('Error completing task:', error);
      alert('Error marking task as complete.');
    } else {
      setCompletedTaskIds(new Set([...completedTaskIds, selectedTaskForProof.id]));
      setSelectedTaskForProof(null);
    }
    
    setIsUploadingProof(false);
  };

  // Goddess/Dev views proofs for a task
  const handleViewProofs = async (task) => {
    setViewingProofsForTask(task);
    setIsLoadingProofs(true);
    setProofsList([]);

    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proofs:', error);
      alert('Failed to fetch proofs.');
    } else {
      setProofsList(data || []);
    }
    
    setIsLoadingProofs(false);
  };
  
  // Media Carousel Renderer
  const renderMedia = (urls, fallbackUrl) => {
    let activeUrls = [];
    if (urls && urls.length > 0) activeUrls = urls;
    else if (fallbackUrl) activeUrls = [fallbackUrl];
    
    if (activeUrls.length === 0) return null;

    if (activeUrls.length === 1) {
      const url = activeUrls[0];
      const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
      return isVideo ? (
        <video src={url} controls className="wall__card-media-item" style={{maxHeight: '300px', width: '100%', objectFit: 'contain', background: '#000', borderRadius: '8px', marginTop: '10px'}} />
      ) : (
        <img src={url} alt="Proof evidence" className="wall__card-media-item" loading="lazy" style={{maxHeight: '300px', width: '100%', objectFit: 'contain', background: '#000', borderRadius: '8px', marginTop: '10px'}} />
      );
    }

    return (
      <div className="wall__card-carousel" style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden' }}>
        {activeUrls.map((url, i) => {
          const isVideo = url.match(/\.(mp4|webm|mov)(\?.*)?$/i);
          return (
            <div key={i} className="wall__card-carousel-slide">
              {isVideo ? (
                <video src={url} controls className="wall__card-media-item" style={{maxHeight: '300px', width: '100%', objectFit: 'contain', background: '#000'}} />
              ) : (
                <img src={url} alt={`Evidence ${i+1}`} className="wall__card-media-item" loading="lazy" style={{maxHeight: '300px', width: '100%', objectFit: 'contain', background: '#000'}} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Calculate points
  const totalPoints = tasks.reduce((sum, task) => {
    return completedTaskIds.has(task.id) ? sum + task.points : sum;
  }, 0);

  const completedCount = completedTaskIds.size;
  const totalCount = tasks.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="page tasks-page" id="free-tasks-page">
      {/* Page Header */}
      <header className="page__header" id="tasks-header">
        <h1 className="page__title" id="tasks-title">Worship Tasks</h1>
        <p className="page__subtitle" id="tasks-subtitle">
          Prove your worth. Complete tasks to earn recognition and points.
        </p>
      </header>

      {/* Sub Stats Area */}
      {isSub && (
        <section className="tasks__stats-container" style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div className="tasks__points-card" style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', display: 'inline-block' }}>
            <span className="tasks__points-label" style={{ display: 'block', fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Total Points Earned</span>
            <span className="tasks__points-value" style={{ display: 'block', fontSize: '3rem', color: 'var(--color-gold)', fontFamily: 'var(--font-display)', marginBottom: '1rem', textShadow: '0 0 20px rgba(212,168,67,0.4)' }}>{totalPoints}</span>
            <button className="wishlist__tribute-btn" onClick={() => navigate('/store')}>
              Redeem Points
            </button>
          </div>

          <section className="tasks__progress" id="tasks-tracker" aria-label="Progress tracker" style={{ marginTop: '2rem' }}>
            <p className="tasks__progress-text" id="tasks-progress-text">
              <span>{completedCount}</span> of <span>{totalCount}</span> tasks completed
            </p>
            <div
              className="tasks__progress-bar"
              id="tasks-progress-bar"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div
                className="tasks__progress-fill"
                id="tasks-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>
        </section>
      )}

      {/* Goddess / Dev Add Task Form */}
      {isGoddessOrDev && (
        <section className="tasks__admin-section" style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '2rem' }}>
          <h2 className="tasks__admin-title" style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)', marginBottom: '1rem' }}>Add New Task</h2>
          <form className="tasks__admin-form" onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
              <label htmlFor="taskTitle" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Task Description</label>
              <input
                id="taskTitle"
                type="text"
                placeholder="e.g. Write a 500-word essay"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="wishlist__tribute-input"
              />
            </div>
            <div className="tasks__admin-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="taskDiff" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Difficulty</label>
                <select
                  id="taskDiff"
                  value={newTaskDifficulty}
                  onChange={(e) => setNewTaskDifficulty(e.target.value)}
                  className="wishlist__tribute-input"
                  style={{ appearance: 'none', background: 'rgba(255,255,255,0.03)' }}
                >
                  <option value="Easy" style={{ color: 'black' }}>Easy</option>
                  <option value="Medium" style={{ color: 'black' }}>Medium</option>
                  <option value="Hard" style={{ color: 'black' }}>Hard</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="taskTime" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Estimated Time</label>
                <input
                  id="taskTime"
                  type="text"
                  placeholder="e.g. 30 mins"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  required
                  className="wishlist__tribute-input"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="taskPoints" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Points Reward</label>
                <input
                  id="taskPoints"
                  type="number"
                  placeholder="10"
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(e.target.value)}
                  required
                  min="1"
                  className="wishlist__tribute-input"
                />
              </div>
            </div>
            <button type="submit" className="wishlist__tribute-btn" disabled={isSubmitting} style={{ marginTop: '0.5rem' }}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </section>
      )}

      {/* Task Cards List */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-gold)' }}>Loading Tasks...</p>
      ) : (
        <div className="tasks__list" id="tasks-list" role="list">
          {tasks.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No tasks available yet.</p>}
          
          {tasks.map((task, index) => {
            const isCompleted = completedTaskIds.has(task.id);
            return (
              <div
                key={task.id}
                className={`tasks__card ${isCompleted ? 'tasks__card--completed' : ''}`}
                id={`task-card-${task.id}`}
                onClick={() => handleTaskClick(task)}
                role={isSub && !isCompleted ? 'button' : 'listitem'}
                tabIndex={isSub && !isCompleted ? 0 : -1}
                aria-pressed={isCompleted}
                style={{ cursor: (isSub && !isCompleted) ? 'pointer' : 'default', position: 'relative' }}
              >
                {/* Subtle Checkmark Overlay */}
                {isCompleted && (
                  <div className="tasks__card-overlay" id={`task-overlay-${task.id}`} aria-hidden="true">
                    <span>✓</span>
                    <span>Completed</span>
                  </div>
                )}

                {/* Task Number (Gold Circle) */}
                <div className="tasks__card-number" id={`task-number-${task.id}`}>
                  {index + 1}
                </div>

                {/* Content: Description and Meta */}
                <div className="tasks__card-content">
                  <p className="tasks__card-description" id={`task-desc-${task.id}`}>
                    {task.title}
                  </p>
                  <div className="tasks__card-meta">
                    <span
                      className={`tasks__card-difficulty tasks__card-difficulty--${task.difficulty.toLowerCase()}`}
                      id={`task-badge-${task.id}`}
                    >
                      {task.difficulty}
                    </span>
                    <span className="tasks__card-time" id={`task-time-${task.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏱️ {task.time_estimate}
                    </span>
                    <span className="tasks__card-points" style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>
                      +{task.points} Points
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="tasks__card-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: 'auto' }}>
                  {isSub && !isCompleted && (
                    <span className="tasks__card-checkbox" role="checkbox" aria-checked={false}></span>
                  )}
                  {isSub && isCompleted && (
                    <span className="tasks__card-checkbox" role="checkbox" aria-checked={true}>✓</span>
                  )}
                  {isGoddessOrDev && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleViewProofs(task); }}
                        style={{
                          background: 'transparent',
                          color: 'var(--color-gold)',
                          border: '1px solid var(--color-gold)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          zIndex: 10
                        }}
                        title="View Submitted Proofs"
                      >
                        View Proofs
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        style={{
                          background: 'var(--color-accent)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          zIndex: 10
                        }}
                        title="Delete Task"
                      >
                        Delete Task
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sub Proof Submission Modal */}
      {selectedTaskForProof && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-content" style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gold)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ color: 'var(--color-gold)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Submit Proof</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{selectedTaskForProof.title}</p>
            
            <form onSubmit={handleProofSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--color-text-secondary)' }}>Written Proof / Confession</label>
                <textarea 
                  className="wishlist__tribute-input"
                  rows="4" 
                  placeholder="Type your essay, apology, or links here..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--color-text-secondary)' }}>Media Evidence (Photos/Videos)</label>
                <div
                  className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''}`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={pendingPreviews.length === 0 ? handleBrowseClick : undefined}
                  style={{ minHeight: '150px' }}
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
                        {isDragging ? 'Drop Photos/Videos Here' : 'Drag & Drop Media'}
                      </h3>
                      <p className="upload-zone__description">
                        Drop multiple files here, or <span className="upload-zone__browse-btn">browse files</span>
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
                        <button type="button" className="upload-zone__add-more" onClick={handleBrowseClick}>+</button>
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="upload-zone__error-banner" style={{ marginTop: '10px' }}><span>⚠️ {errorMsg}</span></div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="wishlist__tribute-btn" disabled={isUploadingProof} style={{ flex: 1 }}>
                  {isUploadingProof ? 'Uploading & Submitting...' : 'Submit Proof & Earn Points'}
                </button>
                <button type="button" onClick={() => setSelectedTaskForProof(null)} style={{ padding: '0 1.5rem', background: 'transparent', color: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goddess Proof Viewing Modal */}
      {viewingProofsForTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-content" style={{ background: 'var(--color-bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gold)', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ color: 'var(--color-gold)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Submissions</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{viewingProofsForTask.title}</p>
              </div>
              <button onClick={() => setViewingProofsForTask(null)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {isLoadingProofs ? (
              <p style={{ textAlign: 'center', color: 'var(--color-gold)' }}>Loading proofs...</p>
            ) : proofsList.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>No subs have completed this task yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {proofsList.map((proof, i) => (
                  <div key={proof.id} style={{ background: 'var(--color-bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>Sub #{proof.user_id.substring(0, 8)}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(proof.created_at).toLocaleString()}</span>
                    </div>
                    
                    {proof.proof_text && (
                      <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)' }}>{proof.proof_text}</p>
                      </div>
                    )}
                    
                    {/* Render Inline Media Gallery */}
                    {renderMedia(proof.proof_media_urls, proof.proof_file_url)}
                    
                    {!proof.proof_text && (!proof.proof_media_urls || proof.proof_media_urls.length === 0) && !proof.proof_file_url && (
                      <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>No proof provided.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
