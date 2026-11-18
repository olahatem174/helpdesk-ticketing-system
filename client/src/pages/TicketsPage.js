import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ticketService, categoryService } from '../services/ticketService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import { formatDate, getErrorMessage } from '../utils/helpers';

export default function TicketsPage() {
  const [tickets, setTickets]     = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [categories, setCategories] = useState([]);
  const [filters, setFilters]     = useState({ status:'', priority:'', category:'', search:'' });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchTickets = useCallback(async (page=1) => {
    setLoading(true);
    try {
      const r = await ticketService.getAll({ ...filters, page, limit:20 });
      setTickets(r.data.tickets); setPagination(r.data.pagination);
    } catch(e){ setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(()=>{ fetchTickets(1); }, [fetchTickets]);
  useEffect(()=>{ categoryService.getAll().then(r=>setCategories(r.data)).catch(()=>{}); }, []);

  const sel = k => e => setFilters(f=>({...f,[k]:e.target.value}));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-subtitle">{pagination.total} ticket{pagination.total!==1?'s':''} found</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">＋ New Ticket</Link>
      </div>

      {/* Filters */}
      <div className="card" style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:18,padding:14}}>
        <input className="form-control" style={{flex:1,minWidth:180}} placeholder="Search tickets..." value={filters.search} onChange={sel('search')}/>
        <select className="form-control" style={{width:150}} value={filters.status}   onChange={sel('status')}>
          <option value="">All Statuses</option>
          {['open','in_progress','resolved','closed'].map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="form-control" style={{width:140}} value={filters.priority} onChange={sel('priority')}>
          <option value="">All Priorities</option>
          {['high','medium','low'].map(p=><option key={p} value={p}>{p}</option>)}
        </select>
        <select className="form-control" style={{width:150}} value={filters.category} onChange={sel('category')}>
          <option value="">All Categories</option>
          {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {Object.values(filters).some(Boolean) &&
          <button className="btn btn-secondary btn-sm" onClick={()=>setFilters({status:'',priority:'',category:'',search:''})}>Clear</button>}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {loading
          ? <div className="loading-center"><span className="spinner"/> Loading tickets...</div>
          : tickets.length===0
          ? <div className="empty-state"><h3>No tickets found</h3><p>Adjust filters or create a new ticket.</p></div>
          : <div className="table-wrapper">
              <table>
                <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Submitted by</th><th>Created</th></tr></thead>
                <tbody>
                  {tickets.map(t=>(
                    <tr key={t.id}>
                      <td><Link to={`/tickets/${t.id}`} style={{color:'var(--tx)',fontWeight:500}}>{t.title}</Link></td>
                      <td>{t.category||'—'}</td>
                      <td><PriorityBadge priority={t.priority}/></td>
                      <td><StatusBadge status={t.status}/></td>
                      <td>{t.created_by_name}</td>
                      <td>{formatDate(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
        <Pagination page={pagination.page} pages={pagination.pages} onPageChange={p=>fetchTickets(p)}/>
      </div>
    </div>
  );
}
