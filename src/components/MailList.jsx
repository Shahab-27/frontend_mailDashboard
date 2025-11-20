import MailCard from './MailCard';
import styles from './MailList.module.css';

const folderLabels = {
  inbox: 'Inbox',
  sent: 'Sent',
  trash: 'Trash',
};

const MailList = ({ mails, loading, selectedId, onSelect, folder }) => (
  <section className={styles.list}>
    <div className={styles.header}>
      <div>
        <h3>{folderLabels[folder] || 'Emails'}</h3>
        <p>{mails.length} messages</p>
      </div>
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

