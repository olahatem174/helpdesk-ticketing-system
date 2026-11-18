# HelpDesk Pro — API Reference

Base URL: `http://localhost:5000/api`
Protected routes require: `Authorization: Bearer <token>`

## Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /auth/register | Public |
| POST | /auth/login | Public |
| GET  | /auth/me | Protected |

## Tickets
| Method | Endpoint | Access |
|--------|----------|--------|
| GET    | /tickets | All roles |
| POST   | /tickets | All roles |
| GET    | /tickets/:id | All roles |
| PUT    | /tickets/:id | Creator / Admin |
| PUT    | /tickets/:id/status | Technician / Admin |
| PUT    | /tickets/:id/assign | Admin only |
| DELETE | /tickets/:id | Admin only |

## Comments
| Method | Endpoint | Access |
|--------|----------|--------|
| GET  | /tickets/:id/comments | All roles |
| POST | /tickets/:id/comments | All roles |
| DELETE | /tickets/:id/comments/:commentId | Author / Admin |

## Users (Admin only)
| Method | Endpoint |
|--------|----------|
| GET    | /users |
| PUT    | /users/:id |
| DELETE | /users/:id |

## Dashboard & Categories
| Method | Endpoint |
|--------|----------|
| GET | /dashboard |
| GET | /categories |

## Query Parameters (GET /tickets)
- `status` — open | in_progress | resolved | closed
- `priority` — low | medium | high
- `category` — category ID
- `search` — full-text search on title/description
- `page` — page number (default: 1)
- `limit` — results per page (default: 20)

## Error Format
```json
{ "error": "Human-readable message", "details": [] }
```
