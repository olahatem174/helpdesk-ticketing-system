import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

const Layout = () => (
  <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
    <Sidebar />
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
      <Topbar />
      <main style={{flex:1,overflowY:'auto',padding:'26px 30px'}}><Outlet /></main>
    </div>
  </div>
);
export default Layout;
