
# Subscription Management Dashboard task

**Public repo:** `subscription-dashboard-task`  # Name  : Akash
# Contact : 8608841928

## Project summary
A mini SaaS admin dashboard that lets users subscribe to plans, view their active plan and manage their profile. Includes role-based authentication (user / admin), subscription management endpoints, and a responsive frontend.


>  the project runs locally; see setup below.

---

## Tech stack
**Frontend**
- React (Vite)
- React Router
- Redux / Redux-Saga (or Redux Toolkit)
- Bootstrap / Reactstrap
- Axios (with token refresh interceptor)

**Backend**
- Node.js + Express
- MongoDB (Atlas)
- Mongoose
- JWT (access + refresh tokens)
- bcryptjs for password hashing
- Zod for validation


Server (backend)

1 .Go to server folder:

cd server

2. Install dependencies:

npm install


3 .Create .env (based on .env.example) and set values:

MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a_long_random_secret>
JWT_REFRESH_SECRET=<a_long_random_refresh_secret>
PORT=5000
NODE_ENV=development


4.Seed plans and optionally admin user (one-time):

# if you added seed script
npm run seed


5.Start server (development):

npm run dev
# or production
npm start

Server API base: http://localhost:5000/api

Client (frontend)

1 .Open new terminal and go to client:

cd ../client


2 .Install:

npm install


3 .Create .env (based on .env.example) and set:

VITE_API_URL=http://localhost:5000/api

VITE_APP_DEFAULTAUTH=jwt


4 .Start dev server:

npm run dev

Open http://localhost:5173 (Vite default) in your browser.


API endpoints (summary)

Auth

POST /api/auth/register — register

POST /api/auth/login — login (returns tokens.access and sets httpOnly refresh cookie)

POST /api/auth/refresh — refresh access token (uses refresh cookie)

POST /api/auth/logout — logout

Plans & Subscriptions

GET /api/plans — list plans

POST /api/plans/subscribe/:planId — subscribe (authenticated)

GET /api/plans/my-subscription — get my subscription (authenticated)

GET /api/plans/admin/subscriptions — admin only (list all)

Notes & troubleshooting

Make sure MongoDB Atlas IP whitelist contains your machine IP or 0.0.0.0/0 for dev.

Frontend must use VITE_API_URL set at build time (Vercel env). Rebuild after env changes.

Backend cookies for refresh require withCredentials: true on client requests.


