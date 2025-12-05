import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import useMailStore from '../store/mailStore';
import api from '../utils/api';
import styles from './ComposeModal.module.css';

const initialState = {
  to: '',
  cc: '',
  bcc: '',
  subject: '',
  body: '',
  htmlBody: '',
  scheduledDate: '',
  scheduledTime: '',
};

const ComposeModal = () => {
  const { isComposeOpen, toggleCompose, sendMail, saveDraft, composeDraft } = useMailStore();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [draftState, setDraftState] = useState({ saving: false, message: '' });
  const [draftId, setDraftId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isRichText, setIsRichText] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!isComposeOpen) {
      setForm(initialState);
      setDraftId(null);
      setDraftState({ saving: false, message: '' });
      setStatus({ loading: false, error: '' });
      setAiLoading(false);
      return;
    }

    if (composeDraft) {
      setForm({
        to: composeDraft.to || '',
        cc: composeDraft.cc || '',
        bcc: composeDraft.bcc || '',
        subject: composeDraft.subject || '',
        body: composeDraft.body || '',
        htmlBody: composeDraft.htmlBody || '',
        scheduledDate: composeDraft.scheduledDate || '',
        scheduledTime: composeDraft.scheduledTime || '',
      });
      setDraftId(composeDraft._id || null);
      setShowCC(!!composeDraft.cc);
      setShowBCC(!!composeDraft.bcc);
      setShowSchedule(!!composeDraft.scheduledDate);
      setIsRichText(!!composeDraft.htmlBody);
    } else {
      setForm(initialState);
      setDraftId(null);
      setShowCC(false);
      setShowBCC(false);
      setShowSchedule(false);
      setIsRichText(false);
    }

    setDraftState({ saving: false, message: '' });
    setStatus({ loading: false, error: '' });
  }, [isComposeOpen, composeDraft]);

  if (!isComposeOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRichTextChange = () => {
    if (editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.innerText;
      setForm((prev) => ({
        ...prev,
        htmlBody: htmlContent,
        body: textContent,
      }));
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleRichTextChange();
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update HTML content if rich text is enabled
    if (isRichText && editorRef.current) {
      const htmlContent = editorRef.current.innerHTML;
      const textContent = editorRef.current.innerText;
      setForm((prev) => ({
        ...prev,
        htmlBody: htmlContent,
        body: textContent,
      }));
    }

    setStatus({ loading: true, error: '' });
    try {
      const mailData = { ...form };
      
      // Combine scheduled date and time if scheduling
      if (showSchedule && form.scheduledDate && form.scheduledTime) {
        mailData.scheduledAt = `${form.scheduledDate}T${form.scheduledTime}`;
      }
      
      await sendMail({ ...mailData, draftId });
      toggleCompose(false);
    } catch (error) {
      setStatus({ loading: false, error });
    }
  };

  const handleSaveDraft = async () => {
    setDraftState({ saving: true, message: '' });
    setStatus((prev) => ({ ...prev, error: '' }));
    try {
      const draft = await saveDraft({ id: draftId, ...form });
      setDraftId(draft._id);
      setDraftState({ saving: false, message: 'Draft saved' });
    } catch (error) {
      setDraftState({ saving: false, message: '' });
      setStatus((prev) => ({ ...prev, error }));
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) toggleCompose(false);
  };

  const handleAIGenerate = async () => {
    if (!form.body.trim()) {
      setStatus({ loading: false, error: 'Please enter a message first' });
      return;
    }

    setAiLoading(true);
    setStatus({ loading: false, error: '' });

    try {
      const response = await api.post('/mail/generate-formal', {
        message: form.body,
      });

      if (response.data && response.data.message) {
        const generatedText = response.data.message;
        if (isRichText && editorRef.current) {
          editorRef.current.innerHTML = generatedText.replace(/\n/g, '<br>');
        }
        setForm((prev) => ({ ...prev, body: generatedText, htmlBody: isRichText ? generatedText.replace(/\n/g, '<br>') : '' }));
        setStatus({ loading: false, error: '' });
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate formal message. Please try again.';
      setStatus({ loading: false, error: errorMessage });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalContent}>
          <header className={styles.header}>
            <h3>Compose Mail</h3>
            <button type="button" className={styles.closeBtn} aria-label="Close compose window" onClick={() => toggleCompose(false)}>
              <XMarkIcon />
            </button>
          </header>
        <label>
          To
          <input name="to" type="email" value={form.to} required onChange={handleChange} placeholder="recipient@example.com" />
        </label>
        <div className={styles.optionalFields}>
          <button 
            type="button" 
            className={`${styles.linkBtn} ${(showCC || form.cc) ? styles.active : ''}`} 
            onClick={() => {
              if (showCC) {
                setShowCC(false);
                if (!form.cc) {
                  setForm(prev => ({ ...prev, cc: '' }));
                }
              } else {
                setShowCC(true);
              }
            }}
          >
            Cc
          </button>
          <button 
            type="button" 
            className={`${styles.linkBtn} ${(showBCC || form.bcc) ? styles.active : ''}`} 
            onClick={() => {
              if (showBCC) {
                setShowBCC(false);
                if (!form.bcc) {
                  setForm(prev => ({ ...prev, bcc: '' }));
                }
              } else {
                setShowBCC(true);
              }
            }}
          >
            Bcc
          </button>
        </div>
        {(showCC || form.cc) && (
          <label>
            Cc
            <input name="cc" type="email" value={form.cc} onChange={handleChange} placeholder="cc@example.com" />
          </label>
        )}
        {(showBCC || form.bcc) && (
          <label>
            Bcc
            <input name="bcc" type="email" value={form.bcc} onChange={handleChange} placeholder="bcc@example.com" />
          </label>
        )}
        <label>
          Subject
          <input name="subject" value={form.subject} onChange={handleChange} placeholder="Email subject" />
        </label>
        <label className={styles.messageLabel}>
          <span>Message</span>
          {isRichText ? (
            <div className={styles.richTextWrapper}>
              <div className={styles.toolbar}>
                <button type="button" onClick={() => formatText('bold')} title="Bold">
                  <strong>B</strong>
                </button>
                <button type="button" onClick={() => formatText('italic')} title="Italic">
                  <em>I</em>
                </button>
                <button type="button" onClick={() => formatText('underline')} title="Underline">
                  <u>U</u>
                </button>
                <div className={styles.toolbarDivider}></div>
                <button type="button" onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                  •
                </button>
                <button type="button" onClick={() => formatText('insertOrderedList')} title="Numbered List">
                  1.
                </button>
                <div className={styles.toolbarDivider}></div>
                <button type="button" onClick={() => {
                  const url = prompt('Enter URL:');
                  if (url) formatText('createLink', url);
                }} title="Insert Link">
                  🔗
                </button>
              </div>
              <div
                ref={editorRef}
                className={styles.richTextEditor}
                contentEditable
                onInput={handleRichTextChange}
                dangerouslySetInnerHTML={{ __html: form.htmlBody || form.body.replace(/\n/g, '<br>') }}
              />
              <button
                type="button"
                className={styles.aiButton}
                onClick={handleAIGenerate}
                disabled={aiLoading || !form.body.trim()}
                title="Generate formal message with AI"
                aria-label="Generate formal message with AI"
              >
                {aiLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <svg
                    className={styles.sparkleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <div className={styles.textareaWrapper}>
              <textarea name="body" rows={6} value={form.body} onChange={handleChange} />
              <button
                type="button"
                className={styles.aiButton}
                onClick={handleAIGenerate}
                disabled={aiLoading || !form.body.trim()}
                title="Generate formal message with AI"
                aria-label="Generate formal message with AI"
              >
                {aiLoading ? (
                  <div className={styles.spinner}></div>
                ) : (
                  <svg
                    className={styles.sparkleIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          )}
        </label>
        {showSchedule && (
          <label>
            <div className={styles.scheduleHeader}>
              <ClockIcon className={styles.clockIcon} />
              <span>Schedule Send</span>
              <button type="button" className={styles.removeBtn} onClick={() => {
                setShowSchedule(false);
                setForm(prev => ({ ...prev, scheduledDate: '', scheduledTime: '' }));
              }}>
                ×
              </button>
            </div>
            <div className={styles.scheduleInputs}>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required={showSchedule}
              />
              <input
                type="time"
                name="scheduledTime"
                value={form.scheduledTime}
                onChange={handleChange}
                required={showSchedule}
              />
            </div>
          </label>
        )}
        {status.error && <p className={styles.error}>{status.error}</p>}
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <button type="button" className={styles.secondaryBtn} onClick={handleSaveDraft} disabled={draftState.saving || status.loading}>
              {draftState.saving ? 'Saving…' : draftId ? 'Update Draft' : 'Save Draft'}
            </button>
            {!showSchedule && (
              <button
                type="button"
                className={styles.scheduleBtn}
                onClick={() => setShowSchedule(true)}
                title="Schedule email"
              >
                <ClockIcon />
                Schedule
              </button>
            )}
          </div>
          <button type="submit" className={styles.sendBtn} disabled={status.loading}>
            <PaperAirplaneIcon />
            {status.loading ? 'Sending…' : showSchedule ? 'Schedule' : 'Send Mail'}
          </button>
        </div>
        {draftState.message && <p className={styles.meta}>{draftState.message}</p>}
        </div>
        <div className={styles.modalSidebar}>
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Quick Actions</h4>
            <div className={styles.quickActions}>
              <button
                type="button"
                className={`${styles.quickActionBtn} ${isRichText ? styles.active : ''}`}
                onClick={() => setIsRichText(!isRichText)}
                title="Toggle rich text editor"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
                  <path d="M6 12h9"></path>
                </svg>
                <span>Rich Text</span>
              </button>
              <button
                type="button"
                className={`${styles.quickActionBtn} ${showSchedule ? styles.active : ''}`}
                onClick={() => setShowSchedule(!showSchedule)}
                title="Schedule email"
              >
                <ClockIcon />
                <span>Schedule</span>
              </button>
            </div>
          </div>
          
          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Email Info</h4>
            <div className={styles.emailInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>To:</span>
                <span className={styles.infoValue}>{form.to || 'Not set'}</span>
              </div>
              {form.cc && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cc:</span>
                  <span className={styles.infoValue}>{form.cc}</span>
                </div>
              )}
              {form.bcc && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Bcc:</span>
                  <span className={styles.infoValue}>{form.bcc}</span>
                </div>
              )}
              {form.subject && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Subject:</span>
                  <span className={styles.infoValue}>{form.subject}</span>
                </div>
              )}
              {showSchedule && form.scheduledDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Scheduled:</span>
                  <span className={styles.infoValue}>
                    {new Date(`${form.scheduledDate}T${form.scheduledTime}`).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {form.body && (
            <div className={styles.sidebarSection}>
              <h4 className={styles.sidebarTitle}>Preview</h4>
              <div className={styles.previewBox}>
                <div className={styles.previewContent} dangerouslySetInnerHTML={{ __html: form.htmlBody || form.body.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ComposeModal;

