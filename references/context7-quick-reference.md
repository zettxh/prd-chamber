# Context7 Quick Reference

## Apa itu Context7?
MCP server untuk query dokumentasi library/framework terbaru secara real-time.

---

## PRD Chamber Libraries

### State Management — Zustand v5
```bash
context7 query "zustand v5 create store"
context7 query "zustand v5 selectors"
context7 query "zustand v5 persist middleware"
```

### Routing — React Router v7
```bash
context7 query "react router v7 useNavigate"
context7 query "react router v7 data router"
context7 query "react router v7 loader"
```

### Backend — Hono
```bash
context7 query "hono jsx routing"
context7 query "hono middleware"
context7 query "hono context variable"
```

### UI — React Flow
```bash
context7 query "@xyflow react useNodesState"
context7 query "@xyflow react useEdgesState"
```

### Layout — Dagre
```bash
context7 query "dagre graphlib layout"
```

---

## General Libraries

### Backend Frameworks
```bash
context7 query "express middleware"
context7 query "fastify routes"
context7 query "nestjs dependency injection"
```

### Databases
```bash
context7 query "prisma client"
context7 query "drizzle orm"
context7 query "better-sqlite3"
```

### Frontend
```bash
context7 query "nextjs app router"
context7 query "react hooks"
context7 query "tailwind css"
```

### Testing
```bash
context7 query "playwright test"
context7 query "vitest configuration"
```

---

## Kapan Trigger Context7

| Situation | Action |
|-----------|--------|
| Error di console | Query library yang error |
| Implementasi fitur baru | Query library yang dipakai |
| Uncertain dengan API | Verify dengan Context7 |
| Debugging yang stuck | Cek dokumentasi terbaru |
| Setup library baru | Baca quick start guide |

---

## Debugging Workflow (Wajib)

```
Error/Situation
  → STOP
  → context7 query "<library> <issue>"
  → Baca dokumentasi
  → Verify solution
  → Implement
  → Test
```

**Contoh:**
```
Error: useNavigate returns Promise (React Router v7)
  → context7 query "react router v7 useNavigate return type"
  → Solution: navigate() returns Promise, use .catch() for fallback
```
