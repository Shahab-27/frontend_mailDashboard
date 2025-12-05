import styles from './MailCard.module.css';

const formatTime = (date) => {
  try {
    return new Date(date).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    });
  } catch (error) {
    return '';
  }
};

const MailCard = ({ mail, selected, onClick }) => (
  <article
    className={`${styles.card} ${selected ? styles.selected : ''}`}
    onClick={() => onClick(mail)}
  >
    <div className={styles.header}>
      <span className={styles.from}>{mail.from}</span>
      <span className={styles.time}>{formatTime(mail.createdAt)}</span>
    </div>
    <h4 className={styles.subject}>{mail.subject || '(No subject)'}</h4>
    <p className={styles.preview}>{mail.body?.slice(0, 110) || 'No content'}</p>
  </article>
);

export default MailCard;

