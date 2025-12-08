import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, XMarkIcon, ClockIcon, PaperClipIcon } from '@heroicons/react/24/outline';
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
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isComposeOpen) {
      setForm(initialState);
      setDraftId(null);
      setDraftState({ saving: false, message: '' });
      setStatus({ loading: false, error: '' });
      setAiLoading(false);
      setAttachments([]);
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

  //----------------------------------------------------------------
  //  Upload attachments
  //----------------------------------------------------------------
  
  const uploadFilesToCloudinary = async (files) => {
    if (files.length === 0) return [];

    setUploading(true);
    setUploadProgress({});

    try {
      const filePromises = files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              fileData: reader.result,
              fileName: file.name,
              fileType: file.type,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const fileDataArray = await Promise.all(filePromises);

      const response = await api.post('/upload/multiple', {
        files: fileDataArray,
      });

      if (response.data && response.data.files) {
        return response.data.files;
      }
      return [];
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload attachments: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  //----------------------------------------------------------------
  // Submit
  //----------------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        uploadedAttachments = await uploadFilesToCloudinary(attachments);
      }

      const mailData = { ...form, attachments: uploadedAttachments };
      
      if (showSchedule && form.scheduledDate && form.scheduledTime) {
        mailData.scheduledAt = `${form.scheduledDate}T${form.scheduledTime}`;
      }
      
      await sendMail({ ...mailData, draftId });
      toggleCompose(false);
    } catch (error) {
      setStatus({ loading: false, error: error.message || 'Failed to send email' });
    }
  };

  //----------------------------------------------------------------
  // Draft
  //----------------------------------------------------------------

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

  //----------------------------------------------------------------
  // Overlay click
  //----------------------------------------------------------------

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) toggleCompose(false);
  };

  //----------------------------------------------------------------
  // AI
  //----------------------------------------------------------------

  const handleAIGenerate = async () => {
    if (!form.body.trim()) {
      setStatus({ loading: false, error: 'Please write something first' });
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

        setForm((prev) => ({
          ...prev,
          body: generatedText,
          htmlBody: isRichText ? generatedText.replace(/\n/g, '<br>') : '',
        }));

      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    } finally {
      setAiLoading(false);
    }
  };

  //----------------------------------------------------------------
  // UI
  //----------------------------------------------------------------

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalContent}>
          
          <header className={styles.header}>
            <h3>Compose Mail</h3>
            <button type="button" className={styles.closeBtn} aria-label="Close" onClick={() => toggleCompose(false)}>
              <XMarkIcon />
            </button>
          </header>

          {/* To */}
          <label>
            To
            <input name="to" type="email" value={form.to} required onChange={handleChange} />
          </label>

          {/* CC/BCC toggles */}
          <div className={styles.optionalFields}>
            <button type="button" className={`${styles.linkBtn} ${(showCC || form.cc) ? styles.active : ''}`}
              onClick={() => setShowCC(!showCC)}>Cc</button>

            <button type="button" className={`${styles.linkBtn} ${(showBCC || form.bcc) ? styles.active : ''}`}
              onClick={() => setShowBCC(!showBCC)}>Bcc</button>
          </div>

          {showCC && (
            <label>
              Cc
              <input name="cc" type="email" value={form.cc}
                onChange={handleChange}/>
            </label>
          )}

          {showBCC && (
            <label>
              Bcc
              <input name="bcc" type="email" value={form.bcc}
                onChange={handleChange}/>
            </label>
          )}

          {/* Subject */}
          <label>
            Subject
            <input name="subject" value={form.subject} onChange={handleChange} />
          </label>

          {/* MESSAGE SECTION */}
          <div className={styles.messageSection}>
            <label className={styles.messageLabel}>
              Message

              <div className={styles.editorContainer}>
                {isRichText ? (
                  <div className={styles.richTextWrapper}>
                    <div className={styles.toolbar}>
                      <button type="button" onClick={() => formatText('bold')}><strong>B</strong></button>
                      <button type="button" onClick={() => formatText('italic')}><em>I</em></button>
                      <button type="button" onClick={() => formatText('underline')}><u>U</u></button>
                      <div className={styles.toolbarDivider}></div>
                      <button type="button" onClick={() => formatText('insertUnorderedList')}>•</button>
                      <button type="button" onClick={() => formatText('insertOrderedList')}>1.</button>
                      <div className={styles.toolbarDivider}></div>
                    </div>

                    <div
                      ref={editorRef}
                      className={styles.richTextEditor}
                      contentEditable
                      onInput={handleRichTextChange}
                      dangerouslySetInnerHTML={{ __html: form.htmlBody || form.body.replace(/\n/g, '<br>') }}
                    />
                  </div>
                ) : (
                  <div className={styles.textareaWrapper}>
                    <textarea name="body" rows={6} value={form.body} onChange={handleChange}/>
                  </div>
                )}

                {/* AI button (INSIDE bottom-right) */}
                <button
                  type="button"
                  className={styles.aiInside}
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !form.body.trim()}
                >
                  {aiLoading ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <svg className={styles.sparkleIcon} xmlns="http://www.w3.org/2000/svg"
                      fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                    </svg>
                  )}
                </button>

              </div>
            </label>
          </div>

          {showSchedule && (
            <label>
              <div className={styles.scheduleHeader}>
                <ClockIcon className={styles.clockIcon} />
                Schedule Send
                <button type="button" className={styles.removeBtn}
                  onClick={() => setShowSchedule(false)}>×</button>
              </div>
              <div className={styles.scheduleInputs}>
                <input type="date" name="scheduledDate"
                  value={form.scheduledDate} onChange={handleChange}/>
                <input type="time" name="scheduledTime"
                  value={form.scheduledTime} onChange={handleChange}/>
              </div>
            </label>
          )}

          {status.error && <p className={styles.error}>{status.error}</p>}

          <div className={styles.actions}>
            <div className={styles.leftActions}>
              <button type="button" className={styles.secondaryBtn}
                onClick={handleSaveDraft} disabled={draftState.saving || status.loading}>
                {draftState.saving ? 'Saving…' : draftId ? 'Update Draft' : 'Save Draft'}
              </button>
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
              <button type="button"
                className={`${styles.quickActionBtn} ${isRichText ? styles.active : ''}`}
                onClick={() => setIsRichText(!isRichText)}>
                Rich Text
              </button>

              <button type="button"
                className={`${styles.quickActionBtn} ${showSchedule ? styles.active : ''}`}
                onClick={() => setShowSchedule(!showSchedule)}>
                <ClockIcon /> Schedule
              </button>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h4 className={styles.sidebarTitle}>Attachments</h4>
            <button type="button" className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}>
              <PaperClipIcon /> Add Attachment
            </button>

            <input type="file" ref={fileInputRef} multiple style={{ display: 'none' }}
              onChange={(e) => setAttachments(prev => [...prev, ...Array.from(e.target.files||[])])}/>

            {uploading && (
              <div className={styles.uploadStatus}>
                <div className={styles.spinner}></div>
                Uploading…
              </div>
            )}

            {attachments.length>0 && (
              <div className={styles.attachmentsList}>
                {attachments.map((file, i)=>(
                  <div key={i} className={styles.attachmentItem}>
                    <PaperClipIcon className={styles.attachmentIcon}/>
                    <span className={styles.attachmentName}>{file.name}</span>
                    <span className={styles.attachmentSize}>
                      {(file.size/1024).toFixed(1)} KB
                    </span>
                    <button className={styles.removeAttachmentBtn}
                      onClick={()=>setAttachments(prev=>prev.filter((_,idx)=>idx!==i))}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default ComposeModal;
