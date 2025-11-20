import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useMailStore from '../store/mailStore';
import styles from './Login.module.css';

const Login = () => {
  const navigate = useNavigate();
  const authenticate = useMailStore((state) => state.authenticate);
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      await authenticate('login', form);
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
          <h2>Flow through every inbox with ease</h2>
          <p className={styles.heroCopy}>
            Sign in to a serene workspace that keeps conversations, tasks, and follow-ups aligned.
          </p>

          <div className={styles.heroStats}>
            <div>
              <strong>4.9/5</strong>
              <span>Calm user score</span>
            </div>
            <div>
              <strong>12k+</strong>
              <span>Smart automations</span>
            </div>
            <div>
              <strong>60%</strong>
              <span>Less context switching</span>
            </div>
          </div>

          <div className={styles.heroCard}>
            <div className={styles.cardAvatar}>MM</div>
            <div>
              <p>“Inbox zero feels attainable. Modern Mail is my calm zone.”</p>
              <small>— Power users everywhere</small>
            </div>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.brand}>
            <div className={styles.logo}>MM</div>
            <div>
              <p className={styles.kicker}>Welcome back</p>
              <h1>Sign in</h1>
            </div>
          </div>
          <p className={styles.subtitle}>Enter your details to keep the green glow going.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              Email address
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
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </label>

            {status.error && <p className={styles.error}>{status.error}</p>}

            <button className={styles.submit} type="submit" disabled={status.loading}>
              {status.loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className={styles.switch}>
            New here? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;

