import { InboxIcon, PaperAirplaneIcon, TrashIcon, ArchiveBoxIcon, PlusIcon, StarIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { InboxIcon as InboxIconSolid } from '@heroicons/react/24/solid';
import styles from './Sidebar.module.css';

const items = [
  { id: 'inbox', label: 'Inbox', icon: InboxIcon, count: 12 },
  { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon },
  { id: 'starred', label: 'Starred', icon: StarIcon },
  { id: 'drafts', label: 'Drafts', icon: ArchiveBoxIcon },
  { id: 'trash', label: 'Trash', icon: TrashIcon },
  { id: 'spam', label: 'Spam', icon: ShieldExclamationIcon },
];

const Sidebar = ({ activeFolder, onSelectFolder, onCompose, user }) => {
  const isAllActive = activeFolder === 'inbox';
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.brand}>Mailbox</h1>
      </div>

      <button className={styles.composeBtn} onClick={onCompose}>
        <PlusIcon />
        New message
      </button>

      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <button className={`${styles.navItem} ${isAllActive ? styles.active : ''}`} onClick={() => onSelectFolder('inbox')}>
            <span className={styles.navIcon}>◆</span>
            All
          </button>
        </div>
        {items.map((item) => (
          <button key={item.id} className={`${styles.navItem} ${activeFolder === item.id ? styles.active : ''}`} onClick={() => onSelectFolder(item.id)}>
            {activeFolder === item.id && item.id === 'inbox' ? (
              <InboxIconSolid className={styles.icon} />
            ) : (
              <item.icon className={styles.icon} />
            )}
            <span>{item.label}</span>
            {item.count && <span className={styles.badge}>{item.count}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

