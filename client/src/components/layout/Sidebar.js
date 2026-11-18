import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV = [
  { to:'/dashboard',   icon:'⊞', label:'Dashboard', roles:['admin','technician','user'] },
  { to:'/tickets',     icon:'🎫', label:'All Tickets', roles:['admin','technician','user'] },
  { to:'/tickets/new', icon:'＋', label:'New Ticket',  roles:['admin','technician','user'] },
  { to:'/users',       icon:'👥', label:'Users',       roles:['admin'] },
];

const ROLE_LABEL = { admin:'Administrator', technician:'Technician', user:'End User' };

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sb-logo">⚡ HelpDesk<span>Pro</span></div>
      <nav className="sb-nav">
        {NAV.filter(n=>n.roles.includes(user?.role)).map(n => (
          <NavLink key={n.to} to={n.to} end={n.to==='/dashboard'}
            className={({isActive})=>`sb-link${isActive?' sb-link--active':''}`}>
            <span className="sb-icon">{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
      <div className="sb-footer">
        <div className="sb-user">
          <div className="sb-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="sb-name">{user?.name}</div>
            <div className="sb-role">{ROLE_LABEL[user?.role]}</div>
          </div>
        </div>
        <button className="sb-logout" onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
};
export default Sidebar;
