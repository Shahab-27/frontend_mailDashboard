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
    <section className={styles.auth}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src="/logo.png" alt="Modern Mail Logo" className={styles.logo} />
          <h1>Modern Mail</h1>
        </div>
        <h2>Welcome Back!</h2>
        <p className={styles.subtitle}>Access your Modern Mail dashboard with ease.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email Address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {status.error && <p className={styles.error}>{status.error}</p>}

          <button className={styles.submit} type="submit" disabled={status.loading}>
            {status.loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            No account? <Link to="/register" className={styles.link}>Create one</Link>
          </p>
          <p>
            <Link to="/forgot-password" className={styles.link}>Forgot Password?</Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;

