import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService, categoryService } from '../services/ticketService';
import { getErrorMessage } from '../utils/helpers';

export default function CreateTicketPage() {
  const [form, setForm]       = useState({ title:'', description:'', priority:'medium', category_id:'' });
  const [categories, setCats] = useState([]);
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  useEffect(()=>{ categoryService.getAll().then(r=>setCats(r.data)).catch(()=>{}); },[]);
  const f = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try { const r=await ticketService.create(form); navigate(`/tickets/${r.data.id}`); }
    catch(e){ setError(getErrorMessage(e)); setBusy(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">New Ticket</h1><p className="page-subtitle">Submit a request to the IT helpdesk team</p></div>
        <button className="btn btn-secondary" onClick={()=>navigate('/tickets')}>Cancel</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:18,alignItems:'start'}}>
        <form onSubmit={submit} className="card" style={{display:'flex',flexDirection:'column',gap:18}}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input type="text" className="form-control" placeholder="Brief summary of the issue" value={form.title} onChange={f('title')} required autoFocus/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.category_id} onChange={f('category_id')}>
                <option value="">Select category</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-control" value={form.priority} onChange={f('priority')}>
                <option value="low">Low — Minor inconvenience</option>
                <option value="medium">Medium — Has workaround</option>
                <option value="high">High — Blocking, urgent</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-control" placeholder={"Describe the issue:\n• What were you trying to do?\n• What happened instead?\n• Any error messages?"} value={form.description} onChange={f('description')} rows={8} required/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{alignSelf:'flex-start'}} disabled={busy}>
            {busy?<><span className="spinner"/> Submitting...</>:'Submit Ticket'}
          </button>
        </form>

        <div className="card">
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:12}}>💡 Tips for faster resolution</h3>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10}}>
            {['Be specific — include error codes or messages','Mention the affected device or application','Note when the issue started','Set priority correctly — High gets immediate attention','Include your department/location if relevant'].map(tip=>(
              <li key={tip} style={{fontSize:12,color:'var(--tx-2)',paddingLeft:16,position:'relative',lineHeight:1.5}}>
                <span style={{position:'absolute',left:0,color:'var(--accent)'}}>→</span>{tip}
              </li>
            ))}
          </ul>
          <hr className="divider"/>
          <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--tx-m)',marginBottom:10}}>Priority Guide</div>
          {[['high','Critical — complete work stoppage'],['medium','Degraded performance or workaround exists'],['low','Feature request or minor cosmetic issue']].map(([p,d])=>(
            <div key={p} style={{display:'flex',gap:10,marginBottom:8,alignItems:'flex-start'}}>
              <span className={`badge p-${p}`} style={{flexShrink:0}}>{p}</span>
              <span style={{fontSize:11,color:'var(--tx-2)',lineHeight:1.5}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
