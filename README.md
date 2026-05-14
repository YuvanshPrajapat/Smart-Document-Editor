# Smart Document Editor (SDE)

A professional, browser-based document editor with AI-powered OCR, real-time collaboration, LaTeX math support, and multi-format export — built with React, Tiptap, and a FastAPI backend.

---

## Features

### Editor
- Rich-text editing powered by [Tiptap](https://tiptap.dev/) with a familiar tabbed toolbar (Home, Insert, AI Tools)
- A4 page layout rendered directly in the browser for true WYSIWYG editing
- Headings (H1–H3), bold, italic, underline, strikethrough, highlight (multicolor), sub/superscript, and text color
- Bullet lists, ordered lists, and interactive checklists (task lists)
- Text alignment: left, center, right, justify
- Font family selection
- Resizable tables with header rows
- Horizontal dividers
- Inline and block LaTeX math via [KaTeX](https://katex.org/)
- Image embedding (upload or base64) and YouTube video embedding
- Hyperlink insertion with auto-protocol detection
- Smart Tab: inserts 4 non-breaking spaces in prose; indents normally inside lists
- Undo / Redo

### AI Tools
Upload an image and extract content directly into the editor using the AI tab:

| Mode | Description |
|---|---|
| **Standard Text** | OCR — extracts printed text from images |
| **Math Formula** | Converts handwritten or printed equations to LaTeX |
| **Handwriting** | Transcribes handwritten notes to plain text |

AI requests are routed to the FastAPI backend (`/ai/ocr`, `/ai/formula`, `/ai/handwriting`) and results are inserted at the cursor position.

### Real-Time Collaboration
- Built on [Yjs](https://github.com/yjs/yjs) and `y-websocket` for CRDT-based multi-user editing
- Share a document via a generated link (`?docId=...`) — collaborators load the same document automatically
- Collaboration cursors show other active users in the document

### Document Management
- Create, open, rename, save, and delete documents from the sidebar
- **Auto-save** every 30 seconds for open documents
- Manual save with a single click
- Documents are stored per-user on the backend (JWT-authenticated)

### Export
Export the current document in multiple formats:

| Format | Library |
|---|---|
| **PDF** | `html2pdf.js` |
| **DOCX** | `docx` + `file-saver` |
| **HTML** | Native serialisation |
| **Markdown** | Tiptap HTML-to-Markdown conversion |

### Import
- Import existing `.docx` files via [Mammoth.js](https://github.com/mwilliamson/mammoth.js) — content is parsed and loaded into the editor

### Authentication
- JWT-based login and registration
- Token stored in `localStorage` and automatically attached to every API request via an Axios interceptor
- `UserMenu` component decodes the JWT in the browser to display the logged-in username — no extra API call needed
- Logout clears the token and redirects to the login page

### Dark Mode
Full dark mode available on both the login screen and the editor, toggled per-session.

---

## Tech Stack

### Frontend
| Package | Role |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool |
| React Router v6 | Client-side routing |
| Tiptap | Rich-text editor engine |
| Yjs + y-websocket | Real-time CRDT collaboration |
| KaTeX | LaTeX math rendering |
| Mammoth.js | DOCX import |
| html2pdf.js | PDF export |
| docx + file-saver | DOCX export |
| Tailwind CSS v4 | Styling |
| Lucide React | Icons |
| Axios | HTTP client |

### Backend (expected)
| Component | Role |
|---|---|
| FastAPI | REST API + OAuth2 |
| MongoDB | Document & user storage |
| JWT | Authentication tokens |
| WebSocket server | Yjs collaboration sync |

---

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx     # Main editor view, toolbar, sidebar, AI tools
│   ├── Login.tsx         # Login & registration screen
│   └── UserMenu.tsx      # Authenticated user dropdown
├── services/
│   ├── api.ts            # Axios instance with JWT interceptor
│   ├── auth.ts           # Login, register, logout
│   ├── docs.ts           # CRUD operations for documents
│   └── ai.ts             # OCR, formula, and handwriting extraction
├── App.tsx               # Router setup
├── main.tsx              # App entry point
├── index.css             # Tailwind + ProseMirror + A4 page styles
└── App.css               # Legacy Vite styles
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A running FastAPI backend (see environment variables below)
- A Yjs WebSocket server for collaboration (e.g. `y-websocket`)

### Installation

```bash
git clone <your-repo-url>
cd smart-document-editor
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## API Endpoints (Backend Contract)

The frontend expects the following routes on the FastAPI backend:

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login (OAuth2 form data), returns `access_token` |
| `GET` | `/docs/` | List all documents for the authenticated user |
| `POST` | `/docs/` | Create a new document |
| `GET` | `/docs/{id}` | Fetch a single document by ID |
| `PUT` | `/docs/{id}` | Update a document's title and content |
| `DELETE` | `/docs/{id}` | Delete a document |
| `POST` | `/ai/ocr` | Extract printed text from an uploaded image |
| `POST` | `/ai/formula` | Extract LaTeX formula from an uploaded image |
| `POST` | `/ai/handwriting` | Transcribe handwriting from an uploaded image |

All endpoints except `/auth/*` require a `Authorization: Bearer <token>` header.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Tab` | Insert 4 spaces (in prose) / Indent (in lists) |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo |
| Standard Tiptap shortcuts | Bold, Italic, etc. |

---