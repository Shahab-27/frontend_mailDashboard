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

  useEffect(() => {
    if (!isComposeOpen) {
      setForm(initialState);
      setDraftId(null);
      setDraftState({ saving: false, message: '' });
      setStatus({ loading: false, error: '' });
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
        <label>
          Message
          <textarea name="body" rows={6} value={form.body} onChange={handleChange} />
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

