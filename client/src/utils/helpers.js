export const formatDate     = d => d ? new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : '—';
export const formatDateTime = d => d ? new Date(d).toLocaleString('en-US',{year:'numeric',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
export const timeAgo = d => { const s=Math.floor((Date.now()-new Date(d))/1000); if(s<60) return `${s}s ago`; if(s<3600) return `${Math.floor(s/60)}m ago`; if(s<86400) return `${Math.floor(s/3600)}h ago`; return `${Math.floor(s/86400)}d ago`; };
export const getErrorMessage = e => e?.response?.data?.error || e?.message || 'Something went wrong';

export const STATUS_LABELS   = { open:'Open', in_progress:'In Progress', resolved:'Resolved', closed:'Closed' };
export const PRIORITY_LABELS = { low:'Low', medium:'Medium', high:'High' };
export const STATUS_COLORS   = { open:'s-open', in_progress:'s-progress', resolved:'s-resolved', closed:'s-closed' };
export const PRIORITY_COLORS = { low:'p-low', medium:'p-medium', high:'p-high' };
