import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import './Auth.css';

export default function RegisterPage() {
  const [form, setForm]   = useState({ name:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);
  const { register }      = useAuth();
  const navigate          = useNavigate();

  const submit = async e => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try { await register(form.name, form.email, form.password); navigate('/dashboard'); }
    catch(err){ setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const f = (k) => e => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">⚡ HelpDesk<span>Pro</span></div>
        <h1 className="auth-h1">Create account</h1>
        <p className="auth-sub">Get started with HelpDesk Pro</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} className="auth-form">
          {[['name','Full Name','text','Jane Smith'],['email','Email','email','you@company.com'],['password','Password','password','Min. 6 characters'],['confirm','Confirm Password','password','Repeat password']].map(([k,l,t,ph])=>(
            <div key={k} className="form-group">
              <label className="form-label">{l}</label>
              <input type={t} className="form-control" placeholder={ph} value={form[k]} onChange={f(k)} required/>
            </div>
          ))}
          <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={busy}>
            {busy ? <><span className="spinner"/> Creating...</> : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
