import React from 'react';
const Pagination = ({ page, pages, onPageChange }) => {
  if (pages<=1) return null;
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginTop:20,paddingTop:16,borderTop:'1px solid var(--border)'}}>
      <button className="btn btn-secondary btn-sm" onClick={()=>onPageChange(page-1)} disabled={page<=1}>← Prev</button>
      <span style={{fontSize:13,color:'var(--tx-2)'}}>Page {page} of {pages}</span>
      <button className="btn btn-secondary btn-sm" onClick={()=>onPageChange(page+1)} disabled={page>=pages}>Next →</button>
    </div>
  );
};
export default Pagination;
