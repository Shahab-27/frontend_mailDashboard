import styles from './MailCard.module.css';

const formatTime = (date) => {
  try {
    return new Date(date).toLocaleString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '';
  }
};

const getInitial = (value) => (value?.trim()[0]?.toUpperCase() ?? '?');

const MailCard = ({ mail, selected, onClick }) => (
  <article
    className={`${styles.card} ${selected ? styles.selected : ''}`}
    onClick={() => onClick(mail)}
  >
    <div className={styles.avatar}>{getInitial(mail.from)}</div>
    <div className={styles.content}>
      <div className={styles.header}>
        <span className={styles.from}>{mail.from}</span>
        <span className={styles.time}>{formatTime(mail.createdAt)}</span>
      </div>
      <h4 className={styles.subject}>{mail.subject || '(No subject)'}</h4>
      <p className={styles.preview}>{mail.body?.slice(0, 80) || 'No content'}</p>
    </div>
  </article>
);

export default MailCard;

