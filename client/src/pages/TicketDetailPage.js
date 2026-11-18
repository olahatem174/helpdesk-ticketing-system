import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService, userService } from '../services/ticketService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDateTime, timeAgo, getErrorMessage } from '../utils/helpers';
import './TicketDetailPage.css';

export default function TicketDetailPage() {
  const { id } = useParams(); const { user } = useAuth(); const navigate = useNavigate();
  const [ticket, setTicket]       = useState(null);
  const [comments, setComments]   = useState([]);
  const [history, setHistory]     = useState([]);
  const [techs, setTechs]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [comment, setComment]     = useState('');
  const [isInt, setIsInt]         = useState(false);
  const [cBusy, setCBusy]         = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [sBusy, setSBusy]         = useState(false);
  const [assignTo, setAssignTo]   = useState('');
  const [aBusy, setABusy]         = useState(false);

  const isStaff = ['admin','technician'].includes(user.role);

  const load = async () => {
    try {
      const r = await ticketService.getById(id);
      setTicket(r.data.ticket); setComments(r.data.comments); setHistory(r.data.statusHistory);
      setNewStatus(r.data.ticket.status);
    } catch(e){ setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ load(); if(user.role==='admin') userService.getAll({role:'technician'}).then(r=>setTechs(r.data)).catch(()=>{}); },[id]);

  const postComment = async e => {
    e.preventDefault(); if(!comment.trim()) return;
    setCBusy(true);
    try { const r=await ticketService.addComment(id,{body:comment,is_internal:isInt}); setComments(p=>[...p,r.data]); setComment(''); setIsInt(false); }
    catch(e){ setError(getErrorMessage(e)); } finally { setCBusy(false); }
  };

  const updateStatus = async e => {
    e.preventDefault(); setSBusy(true);
    try { const r=await ticketService.updateStatus(id,{status:newStatus,note:statusNote}); setTicket(t=>({...t,status:r.data.status})); setStatusNote(''); await load(); }
    catch(e){ setError(getErrorMessage(e)); } finally { setSBusy(false); }
  };

  const assign = async e => {
    e.preventDefault(); if(!assignTo) return; setABusy(true);
    try { await ticketService.assign(id,{technician_id:assignTo}); await load(); }
    catch(e){ setError(getErrorMessage(e)); } finally { setABusy(false); }
  };

  const del = async () => {
    if(!window.confirm('Delete this ticket permanently?')) return;
    try { await ticketService.delete(id); navigate('/tickets'); }
    catch(e){ setError(getErrorMessage(e)); }
  };

  if (loading) return <div className="loading-center"><span className="spinner"/> Loading ticket...</div>;
  if (error && !ticket) return <div className="alert alert-error">{error}</div>;
  if (!ticket) return null;

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <button className="btn btn-secondary btn-sm" onClick={()=>navigate('/tickets')}>← Back</button>
          <code style={{fontSize:11,color:'var(--tx-m)',background:'var(--bg-el)',padding:'2px 8px',borderRadius:4,border:'1px solid var(--border)'}}>#{ticket.id.slice(0,8)}</code>
          <StatusBadge status={ticket.status}/>
          <PriorityBadge priority={ticket.priority}/>
        </div>
        {user.role==='admin' && <button className="btn btn-danger btn-sm" onClick={del}>Delete</button>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="td-grid">
        <div>
          <div className="card" style={{marginBottom:18}}>
            <h1 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{ticket.title}</h1>
            <div style={{display:'flex',gap:8,fontSize:12,color:'var(--tx-2)',marginBottom:16,flexWrap:'wrap'}}>
              <span>by <strong>{ticket.created_by_name}</strong></span>
              <span>·</span><span>{formatDateTime(ticket.created_at)}</span>
              {ticket.category && <><span>·</span><span>{ticket.category}</span></>}
            </div>
            <hr className="divider"/>
            <p style={{fontSize:13,color:'var(--tx-2)',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{ticket.description}</p>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:600}}>Comments</span>
            <span className="badge" style={{background:'var(--bg-el)',color:'var(--tx-m)',border:'1px solid var(--border)'}}>{comments.length}</span>
          </div>

          {comments.length===0 && <div className="empty-state" style={{paddingBlock:30}}><h3>No comments yet</h3></div>}
          {comments.map(c=>(
            <div key={c.id} className={`comment${c.is_internal?' comment--int':''}`}>
              <div className="comment-head">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="c-av">{c.author_name?.charAt(0).toUpperCase()}</div>
                  <div><div style={{fontSize:12,fontWeight:600,color:'var(--tx)'}}>{c.author_name}</div><div style={{fontSize:10,color:'var(--tx-m)'}}>{c.author_role}</div></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {c.is_internal && <span className="badge" style={{background:'rgba(188,140,255,.15)',color:'var(--info)'}}>Internal</span>}
                  <span style={{fontSize:11,color:'var(--tx-m)'}} title={formatDateTime(c.created_at)}>{timeAgo(c.created_at)}</span>
                </div>
              </div>
              <p style={{fontSize:13,color:'var(--tx-2)',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{c.body}</p>
            </div>
          ))}

          <form onSubmit={postComment} className="card" style={{display:'flex',flexDirection:'column',gap:12,marginTop:14}}>
            <span style={{fontSize:13,fontWeight:600}}>Add response</span>
            <textarea className="form-control" placeholder="Type your response..." value={comment} onChange={e=>setComment(e.target.value)} rows={4}/>
            {isStaff && <label style={{display:'flex',alignItems:'center',gap:7,fontSize:12,color:'var(--tx-2)',cursor:'pointer'}}>
              <input type="checkbox" checked={isInt} onChange={e=>setIsInt(e.target.checked)}/> Mark as internal note (hidden from user)
            </label>}
            <button className="btn btn-primary" disabled={cBusy||!comment.trim()}>
              {cBusy?<><span className="spinner"/> Posting...</>:'Post Response'}
            </button>
          </form>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {isStaff && (
            <div className="card">
              <div className="side-title">Update Status</div>
              <form onSubmit={updateStatus} style={{display:'flex',flexDirection:'column',gap:10}}>
                <select className="form-control" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                  {['open','in_progress','resolved','closed'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
                <textarea className="form-control" placeholder="Optional note..." value={statusNote} onChange={e=>setStatusNote(e.target.value)} rows={2}/>
                <button className="btn btn-primary btn-sm" style={{justifyContent:'center'}} disabled={sBusy||newStatus===ticket.status}>
                  {sBusy?<><span className="spinner"/> Updating...</>:'Update Status'}
                </button>
              </form>
            </div>
          )}

          {user.role==='admin' && (
            <div className="card">
              <div className="side-title">Assign Ticket</div>
              <p style={{fontSize:12,color:'var(--tx-2)',marginBottom:10}}>Currently: <strong>{ticket.assigned_to_name||'Unassigned'}</strong></p>
              <form onSubmit={assign} style={{display:'flex',flexDirection:'column',gap:10}}>
                <select className="form-control" value={assignTo} onChange={e=>setAssignTo(e.target.value)}>
                  <option value="">Select technician...</option>
                  {techs.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <button className="btn btn-secondary btn-sm" style={{justifyContent:'center'}} disabled={aBusy||!assignTo}>
                  {aBusy?<><span className="spinner"/> Assigning...</>:'Assign'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <div className="side-title">Ticket Details</div>
            {[
              ['Status', <StatusBadge status={ticket.status}/>],
              ['Priority', <PriorityBadge priority={ticket.priority}/>],
              ['Category', <span style={{fontSize:12}}>{ticket.category||'—'}</span>],
              ['Assignee', <span style={{fontSize:12}}>{ticket.assigned_to_name||'Unassigned'}</span>],
              ['Created', <span style={{fontSize:12}}>{formatDateTime(ticket.created_at)}</span>],
              ...(ticket.resolved_at?[['Resolved',<span style={{fontSize:12}}>{formatDateTime(ticket.resolved_at)}</span>]]:[]),
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                <span style={{fontSize:12,color:'var(--tx-m)'}}>{l}</span>{v}
              </div>
            ))}
          </div>

          {history.length>0 && (
            <div className="card">
              <div className="side-title">Activity Log</div>
              <div className="hist-list">
                {history.map(h=>(
                  <div key={h.id} className="hist-item">
                    <div className="hist-dot"/>
                    <div>
                      <div style={{fontSize:12,color:'var(--tx-2)'}}>{h.old_status?`${h.old_status} → `:''}
                        <strong>{h.new_status}</strong>
                      </div>
                      <div style={{fontSize:11,color:'var(--tx-m)'}}>by {h.changed_by_name}</div>
                      {h.note&&<div style={{fontSize:11,color:'var(--tx-2)',fontStyle:'italic'}}>"{h.note}"</div>}
                      <div style={{fontSize:11,color:'var(--tx-m)'}}>{timeAgo(h.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
