import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMailStore from '../store/mailStore';
import styles from './Register.module.css';

const Register = () => {
  const navigate = useNavigate();
  const authenticate = useMailStore((state) => state.authenticate);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await authenticate('register', form);
      navigate('/dashboard');
    } catch (error) {
      setStatus({ loading: false, error });
    }
  };

  return (
    <section className={styles.screen}>
      <span className={styles.glowOne} />
      <span className={styles.glowTwo} />
      <div className={styles.frame}>
        <div className={styles.hero}>
          <div className={styles.heroBadge}>Modern Mail</div>
          <h2>Design your inbox with intention</h2>
          <p className={styles.heroCopy}>
            Create an account to unlock focused flows, color-coded folders, and mindful automations.
          </p>

          <div className={styles.heroStats}>
            <div>
              <strong>2 min</strong>
              <span>Account setup</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>Data encrypted</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Priority support</span>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.cardAvatar}>🌱</div>
            <div>
              <p>“Registration was instant and the green glow keeps me energized.”</p>
              <small>— New teammates daily</small>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.brand}>
            <div className={styles.logo}>MM</div>
            <div>
              <p className={styles.kicker}>Step 1 · Create account</p>
              <h1>Join Modern Mail</h1>
            </div>
          </div>
          <p className={styles.subtitle}>Bring your conversations into one calm, green-forward workspace.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Full name
              <input name="name" value={form.name} onChange={handleChange} placeholder="Alex Lee" required />
            </label>
            <label className={styles.field}>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@modernmail.com"
                required
              />
            </label>
            <label className={styles.field}>
              Password
              <input
                type="password"
                name="password"
                minLength={6}
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
              />
            </label>
            {status.error && <p className={styles.error}>{status.error}</p>}
            <button className={styles.submit} type="submit" disabled={status.loading}>
              {status.loading ? 'Creating…' : 'Create account'}
            </button>
          </form>

          <p className={styles.switch}>
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Register;

