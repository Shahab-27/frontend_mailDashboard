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
          {mail.isScheduled && mail.scheduledAt && (
            <div className={styles.scheduledBadge}>
              Scheduled for{' '}
              {new Date(mail.scheduledAt).toLocaleString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
          {mail.htmlBody ? (
            <div 
              className={styles.htmlContent} 
              dangerouslySetInnerHTML={{ __html: mail.htmlBody }} 
            />
          ) : (
            <p className={styles.content}>{mail.body || 'No content'}</p>
          )}
        </div>
        {mail.attachments && mail.attachments.length > 0 && (
          <div className={styles.attachmentsSection}>
            <h3 className={styles.attachmentsTitle}>Attachments ({mail.attachments.length})</h3>
            <div className={styles.attachmentsList}>
              {mail.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attachmentItem}
                >
                  <span className={styles.attachmentIcon}>📎</span>
                  <div className={styles.attachmentInfo}>
                    <span className={styles.attachmentName}>{attachment.fileName}</span>
                    {attachment.fileSize && (
                      <span className={styles.attachmentSize}>
                        {(attachment.fileSize / 1024).toFixed(1)} KB
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MailViewer;

