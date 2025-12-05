import { ArrowUturnLeftIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import styles from './MailViewer.module.css';

const MailViewer = ({ mail, onDelete, onRestore, folder, onEditDraft }) => {
  if (!mail) {
    return <section className={styles.viewerEmpty}>Select a mail to preview</section>;
  }

  const getInitial = (value) => (value?.trim()[0]?.toUpperCase() ?? '?');

  return (
    <section className={styles.viewer}>
      <header className={styles.header}>
        <div className={styles.parties}>
          {folder !== 'sent' && (
            <div className={styles.partyCard}>
              <div className={styles.avatar}>{getInitial(mail.from)}</div>
              <div className={styles.partyDetails}>
                <p className={styles.label}>From</p>
                <p className={styles.address} title={mail.from}>
                  {mail.from}
                </p>
              </div>
            </div>
          )}
          <div className={styles.partyCard}>
            <div className={styles.avatar}>{getInitial(mail.to)}</div>
            <div className={styles.partyDetails}>
              <p className={styles.label}>To</p>
              <p className={styles.address} title={mail.to}>
                {mail.to}
              </p>
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          {folder === 'trash' ? (
            <button className={styles.actionButton} onClick={() => onRestore(mail._id)}>
              <ArrowUturnLeftIcon />
              Restore
            </button>
          ) : folder === 'drafts' ? (
            <>
              <button className={styles.actionButton} onClick={() => onEditDraft?.(mail)}>
                <PencilSquareIcon />
                Edit draft
              </button>
              <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(mail._id)}>
                <TrashIcon />
                Delete
              </button>
            </>
          ) : (
            <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(mail._id)}>
              <TrashIcon />
              Delete
            </button>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.mailMeta}>
          <div>
            <p className={styles.label}>Subject</p>
            <h2 title={mail.subject || '(No subject)'}>{mail.subject || '(No subject)'}</h2>
          </div>
          <p className={styles.timestamp}>
            {new Date(mail.createdAt).toLocaleString(undefined, {
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: 'long',
            })}
          </p>
        </div>
        <div className={styles.contentCard}>
          <p className={styles.content}>{mail.body || 'No content'}</p>
        </div>
      </div>
    </section>
  );
};

export default MailViewer;

