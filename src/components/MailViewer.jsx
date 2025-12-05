import { ArrowUturnLeftIcon, TrashIcon, PencilSquareIcon, PaperClipIcon, LinkIcon, PhotoIcon, PaperAirplaneIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import useMailStore from '../store/mailStore';
import styles from './MailViewer.module.css';

const MailViewer = ({ mail, onDelete, onRestore, folder, onEditDraft }) => {
  const [replyText, setReplyText] = useState('');
  const { sendMail } = useMailStore();

  if (!mail) {
    return <section className={styles.viewerEmpty}>Select a mail to preview</section>;
  }

  const formatDate = (date) => {
    try {
      const d = new Date(date);
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();
      
      if (isToday) {
        return `${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} Today, ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;
      }
      return d.toLocaleString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    try {
      await sendMail({
        to: folder === 'sent' ? mail.to : mail.from,
        subject: `Re: ${mail.subject}`,
        body: replyText,
      });
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    }
  };

  return (
    <section className={styles.viewer}>
      <div className={styles.emailContent}>
        <div className={styles.emailHeader}>
          <div className={styles.emailInfo}>
            <div className={styles.emailAddresses}>
              <span className={styles.emailFrom}>{folder === 'sent' ? mail.to : mail.from}</span>
              {folder === 'sent' && <span className={styles.emailTo}>{mail.from}</span>}
            </div>
            <div className={styles.emailDate}>{formatDate(mail.createdAt)}</div>
          </div>
          <h1 className={styles.emailSubject}>{mail.subject || '(No subject)'}</h1>
        </div>

        <div className={styles.emailBody}>
          <p>{mail.body || 'No content'}</p>
        </div>
      </div>

      <div className={styles.replySection}>
        <form onSubmit={handleSendReply}>
          <textarea
            className={styles.replyInput}
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={6}
          />
          <div className={styles.replyToolbar}>
            <div className={styles.formattingTools}>
              <select className={styles.fontSelect}>
                <option>Tf</option>
              </select>
              <button type="button" className={styles.formatBtn}>B</button>
              <button type="button" className={styles.formatBtn}>I</button>
              <button type="button" className={styles.formatBtn}>U</button>
              <select className={styles.fontSelect}>
                <option>99</option>
              </select>
              <button type="button" className={styles.formatBtn}>≡</button>
              <button type="button" className={styles.formatBtn}>≡</button>
              <button type="button" className={styles.formatBtn}>≡</button>
              <button type="button" className={styles.formatBtn}>≡</button>
            </div>
            <div className={styles.replyActions}>
              <button type="button" className={styles.actionIcon}>
                <PaperClipIcon />
              </button>
              <button type="button" className={styles.actionIcon}>
                <LinkIcon />
              </button>
              <button type="button" className={styles.actionIcon}>😊</button>
              <button type="button" className={styles.actionIcon}>
                <PhotoIcon />
              </button>
              <button type="button" className={styles.actionIcon}>
                <TrashIcon />
              </button>
              <button type="button" className={styles.actionIcon}>
                <EllipsisHorizontalIcon />
              </button>
              <button type="submit" className={styles.sendBtn}>
                <PaperAirplaneIcon />
                Send
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default MailViewer;

