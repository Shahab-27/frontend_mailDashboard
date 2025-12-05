import { useState, useEffect } from 'react';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import useMailStore from '../store/mailStore';
import styles from './ComposeModal.module.css';

const initialState = {
  to: '',
  subject: '',
  body: '',
};

const ComposeModal = () => {
  const { isComposeOpen, toggleCompose, sendMail, saveDraft, composeDraft } = useMailStore();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [draftState, setDraftState] = useState({ saving: false, message: '' });
  const [draftId, setDraftId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const GEMINI_API_KEY = 'AIzaSyDbosh5jfhGyAonmk3Li48528EwbNkhC7I';

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
        subject: composeDraft.subject || '',
        body: composeDraft.body || '',
      });
      setDraftId(composeDraft._id || null);
    } else {
      setForm(initialState);
      setDraftId(null);
    }

    setDraftState({ saving: false, message: '' });
    setStatus({ loading: false, error: '' });
  }, [isComposeOpen, composeDraft]);

  if (!isComposeOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await sendMail({ ...form, draftId });
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
      const prompt = `i have to send mail ${form.body} give only the content in short and formal`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate message');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (generatedText) {
        setForm((prev) => ({ ...prev, body: generatedText.trim() }));
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      setStatus({ loading: false, error: 'Failed to generate formal message. Please try again.' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h3>Compose Mail</h3>
          <button type="button" className={styles.closeBtn} aria-label="Close compose window" onClick={() => toggleCompose(false)}>
            <XMarkIcon />
          </button>
        </header>
        <label>
          To
          <input name="to" type="email" value={form.to} required onChange={handleChange} />
        </label>
        <label>
          Subject
          <input name="subject" value={form.subject} onChange={handleChange} />
        </label>
        <label className={styles.messageLabel}>
          Message
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
        </label>
        {status.error && <p className={styles.error}>{status.error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.secondaryBtn} onClick={handleSaveDraft} disabled={draftState.saving || status.loading}>
            {draftState.saving ? 'Saving…' : draftId ? 'Update Draft' : 'Save Draft'}
          </button>
          <button type="submit" className={styles.sendBtn} disabled={status.loading}>
            <PaperAirplaneIcon />
            {status.loading ? 'Sending…' : 'Send Mail'}
          </button>
        </div>
        {draftState.message && <p className={styles.meta}>{draftState.message}</p>}
      </form>
    </div>
  );
};

export default ComposeModal;

