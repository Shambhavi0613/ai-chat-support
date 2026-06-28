# AI Chat Support Agent

A mini AI-powered customer support chat widget built for the Spur take-home assignment.

## Live Demo
- Frontend: (add Vercel URL after deployment)
- Backend: (add Render URL after deployment)

---

## Tech Stack

**Backend:** Node.js + TypeScript + Express  
**Database:** SQLite + Prisma ORM  
**LLM:** OpenAI GPT-4o Mini  
**Frontend:** React + TypeScript  
**Deployment:** Render (backend) + Vercel (frontend)

---

## How to Run Locally

### Prerequisites
- Node.js v18+
- An OpenAI API key

### 1. Clone the repo
\```bash
git clone https://github.com/your-username/ai-chat-support.git
cd ai-chat-support
\```

### 2. Backend setup
\```bash
cd backend
npm install
\```

Create a `.env` file in the `backend/` folder:
\```
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL="file:./dev.db"
PORT=8000
\```

Run database migrations:
\```bash
npx prisma migrate dev --name init
npx prisma generate
\```

Start the backend:
\```bash
npm run dev
\```

Backend runs on http://localhost:8000

### 3. Frontend setup
Open a new terminal:
\```bash
cd frontend
npm install
\```

Create a `.env` file in the `frontend/` folder:
\```
REACT_APP_API_URL=http://localhost:8000
\```

Start the frontend:
\```bash
npm start
\```

Frontend runs on http://localhost:3000

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `DATABASE_URL` | SQLite file path (default: `file:./dev.db`) |
| `PORT` | Server port (default: 8000) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend URL |

---

## Architecture Overview

### Backend Layers
- **Routes** — handle HTTP, delegate to services, never touch DB directly
- **Services** — all business logic lives here (`llm.service.ts`, `conversation.service.ts`)
- **Middleware** — input validation and global error handler so the server never crashes on bad input
- **Data** — FAQ knowledge hardcoded in `faq.ts` as a system prompt context string

### Design Decisions
- **Separation of concerns** — routes call services, services call DB or LLM. Adding a WhatsApp or Instagram channel means adding a new route that calls the same `generateReply()` function — no logic changes needed.
- **Session-based conversations** — each chat session gets a UUID. The frontend stores it and sends it with every message so conversation history is maintained.
- **LLM provider encapsulation** — `generateReply()` in `llm.service.ts` is the only place that knows about OpenAI. Swapping providers means changing one file.

---

## LLM Notes

**Provider:** OpenAI GPT-4o Mini  
**Why GPT-4o Mini:** Fast, cheap, and capable for FAQ-style support responses.

**Prompting approach:**
- System prompt contains full store FAQ (shipping, returns, support hours, payment methods)
- Full conversation history passed with every request so replies are contextual
- Max tokens capped at 1024 to control cost

**FAQ knowledge** is hardcoded in `src/data/faq.ts` as a system prompt string. In production, this would be stored in the database and fetched dynamically.

**Error handling:**
- 401 → invalid API key message
- 429 → rate limit message
- All other errors → friendly fallback message

---

## Data Model

Conversation
  id          UUID (primary key)
  createdAt   DateTime
  updatedAt   DateTime

Message
  id              UUID (primary key)
  conversationId  UUID (foreign key → Conversation)
  sender          String ("user" | "ai")
  text            String
  timestamp       DateTime

Indexed on conversationId for fast message fetching per session.

---

## Trade-offs & If I Had More Time

- **FAQ in DB** — Would move store knowledge to a database table so it can be updated without redeploying
- **Auth** — Would add session tokens to tie conversations to users
- **Streaming** — Would stream LLM responses token by token for real-time feel
- **Redis caching** — Would cache conversation history to reduce DB reads
- **Tests** — Would add unit tests for services and integration tests for the chat endpoint
- **Rate limiting** — Would add per-IP rate limiting to prevent abuse
- **Multi-channel** — Architecture is designed for this: new channels (WhatsApp, Instagram) add new route files calling the same `generateReply()` service