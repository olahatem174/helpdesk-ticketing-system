import api from './api';
export const ticketService  = {
  getAll:        (p)     => api.get('/tickets', { params: p }),
  getById:       (id)    => api.get(`/tickets/${id}`),
  create:        (data)  => api.post('/tickets', data),
  update:        (id,d)  => api.put(`/tickets/${id}`, d),
  updateStatus:  (id,d)  => api.put(`/tickets/${id}/status`, d),
  assign:        (id,d)  => api.put(`/tickets/${id}/assign`, d),
  delete:        (id)    => api.delete(`/tickets/${id}`),
  addComment:    (id,d)  => api.post(`/tickets/${id}/comments`, d),
  deleteComment: (id,cid)=> api.delete(`/tickets/${id}/comments/${cid}`),
};
export const userService      = { getAll: (p) => api.get('/users',{ params:p }), update:(id,d)=>api.put(`/users/${id}`,d), delete:(id)=>api.delete(`/users/${id}`) };
export const dashboardService = { getStats: () => api.get('/dashboard') };
export const categoryService  = { getAll: () => api.get('/categories') };
