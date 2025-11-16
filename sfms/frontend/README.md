# Secure File Manager (SFMS)

A simple and clean secure file manager with React & Node.js. No database. Local JSON and file storage.

---

## Features
- Register and login (JWT)
- Dashboard with file list
- Upload, view, edit, & delete files
- View file metadata
- Responsive Tailwind UI

---

## Project Structure
```
sfms/
  backend/    # Node.js + Express API
  frontend/   # React app
```

---

## Prerequisites
- Node.js 18+
- npm

---

## Backend Setup
```
cd sfms/backend
npm install
npm start
```
Server: http://localhost:5000

---

## Frontend Setup
```
cd sfms/frontend
npm install
npm run dev
```

Visit: http://localhost:5173

---

## API
- Backend runs at `/api` (proxied by vite in dev)

---

## User Flow
- Register, Login
- Upload, View, Edit, Delete files
- View metadata

---

## Troubleshooting
- Check Node, npm versions
- Use two terminals (backend + frontend)
- If uploads/ missing, create it manually in backend/

---
