import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import './Auth.css';

export default function LoginPage() {
  const [form, setForm]     = useState({ email:'', password:'' });
  const [error, setError]   = useState('');
  const [busy, setBusy]     = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try { await login(form.email, form.password); navigate('/dashboard'); }
    catch(err){ setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">⚡ HelpDesk<span>Pro</span></div>
        <h1 className="auth-h1">Welcome back</h1>
        <p className="auth-sub">Sign in to your IT support account</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="you@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required autoFocus/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={busy}>
            {busy ? <><span className="spinner"/> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">No account? <Link to="/register">Register here</Link></p>
        <div className="auth-demo">
          <p className="demo-title">Demo credentials (register via UI or use schema seed)</p>
          <code>admin@helpdesk.com / tech@helpdesk.com / user@helpdesk.com</code>
        </div>
      </div>
    </div>
  );
}
