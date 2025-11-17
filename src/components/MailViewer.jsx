import { ArrowUturnLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import styles from './MailViewer.module.css';

const MailViewer = ({ mail, onDelete, onRestore, folder }) => {
  if (!mail) {
    return <section className={styles.viewerEmpty}>Select a mail to preview</section>;
  }

  return (
    <section className={styles.viewer}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>From</p>
          <h3>{mail.from}</h3>
        </div>
        <div>
          <p className={styles.label}>To</p>
          <h3>{mail.to}</h3>
        </div>
        <div className={styles.actions}>
          {folder === 'trash' ? (
            <button onClick={() => onRestore(mail._id)}>
              <ArrowUturnLeftIcon />
              Restore
            </button>
          ) : (
            <button onClick={() => onDelete(mail._id)}>
              <TrashIcon />
              Delete
            </button>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <h2>{mail.subject || '(No subject)'}</h2>
        <p className={styles.timestamp}>
          {new Date(mail.createdAt).toLocaleString(undefined, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'long',
          })}
        </p>
        <p className={styles.content}>{mail.body || 'No content'}</p>
      </div>
    </section>
  );
};

export default MailViewer;

