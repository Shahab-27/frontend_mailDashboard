import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import styles from './Topbar.module.css';

const Topbar = ({ onSearch, onLogout, user }) => (
  <header className={styles.topbar}>
    <div className={styles.search}>
      <MagnifyingGlassIcon />
      <input type="text" placeholder="Search mail" onChange={(e) => onSearch?.(e.target.value)} />
    </div>

    <div className={styles.profile}>
      <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'M'}</div>
      <div>
        <p className={styles.name}>{user?.name}</p>
        <p className={styles.email}>{user?.email}</p>
      </div>
      <button className={styles.logout} onClick={onLogout}>
        Logout
      </button>
    </div>
  </header>
);

export default Topbar;

