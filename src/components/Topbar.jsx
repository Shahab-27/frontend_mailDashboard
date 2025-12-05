import { MagnifyingGlassIcon, Cog6ToothIcon, BellIcon, StarIcon, ArchiveBoxArrowDownIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import styles from './Topbar.module.css';

const Topbar = ({ onSearch, onLogout, user }) => (
  <header className={styles.topbar}>
    <div className={styles.search}>
      <MagnifyingGlassIcon />
      <input type="text" placeholder="Search" onChange={(e) => onSearch?.(e.target.value)} />
    </div>

    <div className={styles.actions}>
      <button className={styles.actionBtn}>
        <Cog6ToothIcon />
      </button>
      <button className={styles.actionBtn}>
        <BellIcon />
        <span className={styles.badge}></span>
      </button>
      <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'M'}</div>
      <button className={styles.actionBtn}>
        <StarIcon />
      </button>
      <button className={styles.actionBtn}>
        <ArchiveBoxArrowDownIcon />
      </button>
      <button className={styles.actionBtn}>
        <TrashIcon />
      </button>
      <button className={styles.actionBtn}>
        <EllipsisVerticalIcon />
      </button>
      <button className={styles.logout} onClick={onLogout}>
        Logout
      </button>
    </div>
  </header>
);

export default Topbar;

