import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/ticketService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate, getErrorMessage } from '../utils/helpers';
import './DashboardPage.css';

const Stat = ({ label, value, color }) => (
  <div className="stat" style={{'--c':color}}>
    <span className="stat-val">{value}</span>
    <span className="stat-lbl">{label}</span>
  </div>
);

const Bar = ({ label, count, total, color, badge }) => (
  <div className="bar-row">
    {badge || <span className="bar-label">{label}</span>}
    <div className="bar-track"><div className="bar-fill" style={{width:total?`${(count/total)*100}%`:'0%',background:color}}/></div>
    <span className="bar-count">{count||0}</span>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData]   = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getStats().then(r=>setData(r.data)).catch(e=>setError(getErrorMessage(e)));
  }, []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!data)  return <div className="loading-center"><span className="spinner"/> Loading...</div>;
  const { stats, byPriority, byCategory, recentTickets } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">{user.role==='admin'?'All tickets overview':user.role==='technician'?'Your assigned tickets':'Your submitted tickets'}</p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">＋ New Ticket</Link>
      </div>

      <div className="stats-row">
        <Stat label="Total"       value={stats.total}       color="var(--accent)"/>
        <Stat label="Open"        value={stats.open}        color="var(--accent)"/>
        <Stat label="In Progress" value={stats.in_progress} color="var(--warn)"/>
        <Stat label="Resolved"    value={stats.resolved}    color="var(--ok)"/>
        <Stat label="Closed"      value={stats.closed}      color="var(--tx-m)"/>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h2 className="card-title">Recent Tickets</h2>
            <Link to="/tickets" style={{fontSize:12}}>View all →</Link>
          </div>
          {recentTickets.length===0
            ? <div className="empty-state"><h3>No tickets yet</h3></div>
            : recentTickets.map(t=>(
              <Link key={t.id} to={`/tickets/${t.id}`} className="recent-row">
                <div>
                  <div className="recent-title">{t.title}</div>
                  <div className="recent-meta">{t.created_by_name} · {formatDate(t.created_at)}</div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}><PriorityBadge priority={t.priority}/><StatusBadge status={t.status}/></div>
              </Link>
            ))
          }
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {byPriority && (
            <div className="card">
              <h2 className="card-title" style={{marginBottom:14}}>By Priority</h2>
              <Bar badge={<PriorityBadge priority="high"/>}   count={byPriority.high}   total={stats.total} color="var(--err)"/>
              <Bar badge={<PriorityBadge priority="medium"/>} count={byPriority.medium} total={stats.total} color="var(--warn)"/>
              <Bar badge={<PriorityBadge priority="low"/>}    count={byPriority.low}    total={stats.total} color="var(--ok)"/>
            </div>
          )}
          <div className="card">
            <h2 className="card-title" style={{marginBottom:14}}>By Category</h2>
            {byCategory.map(c=><Bar key={c.name} label={c.name} count={parseInt(c.c||c.count)} total={stats.total} color="var(--accent)"/>)}
          </div>
        </div>
      </div>
    </div>
  );
}
