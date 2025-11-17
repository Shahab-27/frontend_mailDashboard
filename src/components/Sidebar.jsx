 import { InboxIcon, PaperAirplaneIcon, TrashIcon, ArchiveBoxIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import styles from './Sidebar.module.css';

const items = [
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'sent', label: 'Sent', icon: PaperAirplaneIcon },
  { id: 'drafts', label: 'Drafts', icon: ArchiveBoxIcon, disabled: true },
  { id: 'trash', label: 'Trash', icon: TrashIcon },
];

const Sidebar = ({ activeFolder, onSelectFolder, onCompose, user }) => (
  <aside className={styles.sidebar}>
    <div className={styles.header}>
      <span className={styles.brand}>Modern Mail</span>
      <p className={styles.userName}>{user?.name || 'User'}</p>
      <p className={styles.userEmail}>{user?.email}</p>
    </div>

    <button className={styles.composeBtn} onClick={onCompose}>
      <PencilSquareIcon />
      Compose
    </button>

    <nav className={styles.nav}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${activeFolder === item.id ? styles.active : ''}`}
          onClick={() => !item.disabled && onSelectFolder(item.id)}
          disabled={item.disabled}
        >
          <item.icon />
          {item.label}
          {item.disabled && <span className={styles.badge}>Soon</span>}
        </button>
      ))}
    </nav>
  </aside>
);

export default Sidebar;

