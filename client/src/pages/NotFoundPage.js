import React from 'react';
import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',gap:16,textAlign:'center'}}>
      <div style={{fontSize:64}}>🎫</div>
      <h1 style={{fontSize:26,fontWeight:700}}>404 — Not Found</h1>
      <p style={{color:'var(--tx-2)'}}>This page doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
    </div>
  );
}
