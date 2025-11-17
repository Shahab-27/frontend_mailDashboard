import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import MailList from '../components/MailList';
import MailViewer from '../components/MailViewer';
import ComposeModal from '../components/ComposeModal';
import useMailStore from '../store/mailStore';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const [query, setQuery] = useState('');
  const {
    user,
    mails,
    selectedMail,
    folder,
    loading,
    fetchMails,
    fetchMailById,
    setFolder,
    toggleCompose,
    logout,
    deleteMail,
    restoreMail,
  } = useMailStore();

  useEffect(() => {
    fetchMails('inbox').catch(() => {});
  }, []);

  const filteredMails = useMemo(() => {
    if (!query) return mails;
    const lower = query.toLowerCase();
    return mails.filter(
      (mail) =>
        mail.subject?.toLowerCase().includes(lower) ||
        mail.body?.toLowerCase().includes(lower) ||
        mail.from?.toLowerCase().includes(lower)
    );
  }, [mails, query]);

  const handleFolderChange = async (nextFolder) => {
    setFolder(nextFolder);
    await fetchMails(nextFolder).catch(() => {});
  };

  const handleSelectMail = (mail) => {
    fetchMailById(mail._id).catch(() => {});
  };

  const handleDelete = (id) => {
    deleteMail(id).catch(() => {});
  };

  const handleRestore = (id) => {
    restoreMail(id).catch(() => {});
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar
        activeFolder={folder}
        onSelectFolder={handleFolderChange}
        onCompose={() => toggleCompose(true)}
        user={user}
      />
      <div className={styles.main}>
        <Topbar user={user} onSearch={setQuery} onLogout={logout} />
        <div className={styles.workspace}>
          <MailList
            mails={filteredMails}
            loading={loading}
            selectedId={selectedMail?._id}
            onSelect={handleSelectMail}
            folder={folder}
          />
          <MailViewer mail={selectedMail} onDelete={handleDelete} onRestore={handleRestore} folder={folder} />
        </div>
      </div>
      <ComposeModal />
    </div>
  );
};

export default Dashboard;

