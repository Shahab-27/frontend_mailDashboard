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
    <section className={styles.auth}>
      <div className={styles.card}>
        <h1>Create account</h1>
        <p>Build your modern workspace</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            Full name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className={styles.field}>
            Email
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className={styles.field}>
            Password
            <input
              type="password"
              name="password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
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
    </section>
  );
};

export default Register;

