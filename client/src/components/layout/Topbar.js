import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TITLES = {'/dashboard':'Dashboard','/tickets':'Tickets','/tickets/new':'New Ticket','/users':'User Management'};

const Topbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = Object.entries(TITLES).find(([p])=>pathname===p||(p!=='/tickets'&&pathname.startsWith(p)))?.[1]||'HelpDesk Pro';
  const roleStyle = { admin:{bg:'rgba(188,140,255,.15)',color:'var(--info)'}, technician:{bg:'var(--accent-dim)',color:'var(--accent)'}, user:{bg:'rgba(63,185,80,.1)',color:'var(--ok)'} }[user?.role]||{};

  return (
    <header style={{height:'var(--topbar)',background:'var(--bg-card)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',flexShrink:0}}>
      <span style={{fontSize:14,fontWeight:600}}>{title}</span>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{fontSize:13,color:'var(--tx-2)'}}>Hello, <strong>{user?.name?.split(' ')[0]}</strong></span>
        <span className="badge" style={{...roleStyle,fontSize:10}}>{user?.role}</span>
      </div>
    </header>
  );
};
export default Topbar;
