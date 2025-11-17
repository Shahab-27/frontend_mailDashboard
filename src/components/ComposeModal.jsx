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
  const { isComposeOpen, toggleCompose, sendMail } = useMailStore();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState({ loading: false, error: '' });

  useEffect(() => {
    if (!isComposeOpen) {
      setForm(initialState);
      setStatus({ loading: false, error: '' });
    }
  }, [isComposeOpen]);

  if (!isComposeOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await sendMail(form);
      toggleCompose(false);
    } catch (error) {
      setStatus({ loading: false, error });
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <header className={styles.header}>
          <h3>Compose Mail</h3>
          <button type="button" onClick={() => toggleCompose(false)}>
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
        <button type="submit" className={styles.sendBtn} disabled={status.loading}>
          <PaperAirplaneIcon />
          {status.loading ? 'Sending…' : 'Send Mail'}
        </button>
      </form>
    </div>
  );
};

export default ComposeModal;

