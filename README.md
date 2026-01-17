# DSA Sheet - Production Grade Application

A full-stack web application for tracking progress on Data Structures & Algorithms problems.

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL connection available

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize database:
   ```bash
   npm run init-db
   ```

3. Start backend server (Terminal 1):
   ```bash
   npm run dev:server
   ```

4. Start frontend (Terminal 2):
   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173` and create an account

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Topic Organization**: DSA problems organized into 8 major categories:
  - Arrays
  - Strings
  - Linked Lists
  - Trees
  - Graphs
  - Dynamic Programming
  - Sorting & Searching
  - Stack & Queue

- **Problem Tracking**:
  - Checkbox system to mark problems as completed
  - Progress automatically saved to PostgreSQL
  - Resume from where you left off on next login

- **Comprehensive Resources**:
  - LeetCode/Codeforces links for practice
  - YouTube tutorial links
  - Article links for theory reference
  - Difficulty levels (Easy/Medium/Hard)

- **Progress Dashboard**:
  - Overall progress percentage
  - Completed vs total problems counter
  - Per-topic progress tracking
  - Visual progress bars

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

### Backend
- Node.js + Express
- PostgreSQL
- JWT for authentication
- bcryptjs for password hashing

## Architecture

### Frontend Structure
```
src/
├── components/
│   ├── Auth.tsx       # Login/Register page
│   └── Dashboard.tsx  # Main application
├── contexts/
│   └── AuthContext.tsx # Auth state management
├── lib/
│   └── api.ts         # API client
├── App.tsx
└── main.tsx
```

### Backend Structure
```
server/
├── index.ts   # Express server & API routes
├── db.ts      # PostgreSQL connection pool
└── init-db.ts # Database initialization
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Data Endpoints (Require JWT token)
- `GET /api/topics` - Fetch all topics
- `GET /api/problems` - Fetch all problems
- `GET /api/progress` - Fetch user's progress
- `POST /api/progress` - Update problem completion

## Database Schema

**users table**
- Stores user accounts with bcrypt hashed passwords
- Email is unique to prevent duplicate registrations

**topics table**
- Contains DSA topic categories
- Supports ordering for display

**problems table**
- Individual DSA problems with:
  - Multiple resource links (LeetCode, YouTube, Articles)
  - Difficulty classification
  - Description and ordering

**user_progress table**
- Tracks completed problems per user
- Unique constraint ensures one entry per user-problem pair
- Timestamp of completion for analytics

## Sample Data

Pre-loaded with:
- 8 DSA topic categories
- 17 curated practice problems
- Direct links to LeetCode, YouTube tutorials, and GeeksforGeeks articles

## Security Features

- JWT-based stateless authentication
- Password hashing with bcryptjs (10 salt rounds)
- CORS enabled for frontend-backend communication
- SQL injection prevention via parameterized queries
- Secure token expiration (7 days)

## Building for Production

### Frontend
```bash
npm run build
# Output: dist/
```

### Backend
Set environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret (32+ chars)
- `PORT` - Server port (default 5000)

## Deployment Options

### Frontend
- AWS S3 + CloudFront
- Netlify
- Vercel
- Any static hosting service

### Backend
- AWS EC2
- Heroku
- DigitalOcean
- Any VPS/Container platform
- Render, Railway, etc.

## Performance Optimizations

- Database indexes on frequently queried columns
- Connection pooling via pg library
- Lazy loading of components
- Gzip compression on build

## Future Enhancements

- Add problem editorial/solutions
- Implement spaced repetition reminders
- Add social features (friend comparison)
- Problem difficulty distribution analytics
- Export progress as PDF report

## License

Open source and available for educational use.
