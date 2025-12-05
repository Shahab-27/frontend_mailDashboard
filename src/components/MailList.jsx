import MailCard from './MailCard';
import styles from './MailList.module.css';

const folderLabels = {
  inbox: 'Inbox',
  sent: 'Sent',
  drafts: 'Drafts',
  scheduled: 'Scheduled',
  trash: 'Trash',
};

const MailList = ({ mails, loading, selectedId, onSelect, folder, onEmptyTrash }) => (
  <section className={styles.list}>
    <div className={styles.header}>
      <div>
        <h3>{folderLabels[folder] || 'Emails'}</h3>
        <p>{mails.length} messages</p>
      </div>
      {folder === 'trash' && mails.length > 0 && (
        <button className={styles.emptyTrashBtn} onClick={onEmptyTrash}>
          Empty Trash
        </button>
      )}
    </div>

    {loading ? (
      <div className={styles.empty}>Loading messages…</div>
    ) : mails.length === 0 ? (
      <div className={styles.empty}>No mail in this folder</div>
    ) : (
      <div className={styles.cards}>
        {mails.map((mail) => (
          <MailCard key={mail._id} mail={mail} selected={mail._id === selectedId} onClick={onSelect} />
        ))}
      </div>
    )}
  </section>
);

export default MailList;

