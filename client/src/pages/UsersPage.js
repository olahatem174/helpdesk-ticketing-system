import React, { useState, useEffect } from 'react';
import { userService } from '../services/ticketService';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function UsersPage() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [filterRole, setFR] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r=await userService.getAll(filterRole?{role:filterRole}:{}); setUsers(r.data); }
    catch(e){ setError(getErrorMessage(e)); } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); },[filterRole]);

  const changeRole = async (id, role) => {
    setError(''); setSuccess('');
    try { await userService.update(id,{role}); setSuccess('Role updated.'); setUsers(u=>u.map(x=>x.id===id?{...x,role}:x)); }
    catch(e){ setError(getErrorMessage(e)); }
  };

  const toggle = async (id, active) => {
    setError(''); setSuccess('');
    try { await userService.update(id,{is_active:!active}); setSuccess(`User ${active?'deactivated':'reactivated'}.`); setUsers(u=>u.map(x=>x.id===id?{...x,is_active:!active}:x)); }
    catch(e){ setError(getErrorMessage(e)); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">{users.length} accounts</p></div>
        <select className="form-control" style={{width:150}} value={filterRole} onChange={e=>setFR(e.target.value)}>
          <option value="">All Roles</option>
          {['admin','technician','user'].map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="card">
        {loading
          ? <div className="loading-center"><span className="spinner"/> Loading users...</div>
          : <div className="table-wrapper">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id} style={{opacity:u.is_active?1:.5}}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:9}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:'var(--accent-dim)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </div>
                      </td>
                      <td style={{fontFamily:'var(--mono)',fontSize:12}}>{u.email}</td>
                      <td>
                        <select className="form-control" style={{width:120,padding:'3px 8px',fontSize:12}} value={u.role} onChange={e=>changeRole(u.id,e.target.value)}>
                          {['admin','technician','user'].map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td><span className={`badge ${u.is_active?'s-resolved':'s-closed'}`}>{u.is_active?'Active':'Inactive'}</span></td>
                      <td>{formatDate(u.created_at)}</td>
                      <td><button className={`btn btn-sm ${u.is_active?'btn-danger':'btn-secondary'}`} onClick={()=>toggle(u.id,u.is_active)}>{u.is_active?'Deactivate':'Reactivate'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}
