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
        <h1>Welcome back</h1>
        <p>Access your Modern Mail dashboard</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label className={styles.field}>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          {status.error && <p className={styles.error}>{status.error}</p>}

          <button className={styles.submit} type="submit" disabled={status.loading}>
            {status.loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.switch}>
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;

