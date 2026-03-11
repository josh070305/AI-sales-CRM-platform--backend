# AI Sales CRM Backend

Backend API for the AI Sales CRM Platform built with Node.js, Express, MongoDB, Mongoose, JWT auth, Socket.IO, and optional AI plus SMS integrations.

## Features

- JWT authentication with refresh token support
- Role-based access control
- Lead management APIs
- Deal pipeline APIs
- Activity tracking
- Real-time messaging with Socket.IO
- Real-time notifications
- Analytics endpoints
- AI workflow endpoints
- Optional SMS alerts using Twilio
- MongoDB Atlas ready
- Seed script for demo data

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- express-validator
- dotenv
- helmet
- cors
- cookie-parser
- express-rate-limit
- Pino

## Project Structure

```text
backend/
  package.json
  .env.example
  README.md
  scripts/
    seed.js
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    services/
    sockets/
    utils/
    validators/
    app.js
    server.js
```

## API Base URL

```text
http://localhost:5000/api
```

## API Modules

- `/api/auth`
- `/api/users`
- `/api/leads`
- `/api/deals`
- `/api/activities`
- `/api/notifications`
- `/api/messages`
- `/api/analytics`
- `/api/ai`
- `/api/settings`

## Environment Variables

Create a `.env` file in the `backend` folder.

Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ai-sales-crm
CLIENT_URL=http://localhost:5173
JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
COOKIE_SECURE=false

OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

## Run In Production

```bash
npm run start
```

## Seed Demo Data

```bash
npm run seed
```

## Demo Users

After seeding:

- Admin: `admin@aicrm.com` / `Password123!`
- Sales Manager: `manager@aicrm.com` / `Password123!`
- Sales Executive: `rep@aicrm.com` / `Password123!`

## AI Integration

AI endpoints work only if `OPENAI_API_KEY` is configured.

If the key is missing:

- the backend does not crash
- AI endpoints return a graceful fallback message

## Twilio SMS

SMS alerts are optional.

To enable:

- set `TWILIO_ACCOUNT_SID`
- set `TWILIO_AUTH_TOKEN`
- set `TWILIO_PHONE_NUMBER`

If Twilio is not configured, SMS features stay disabled without breaking the app.

## Socket.IO Features

Real-time events include:

- new messages
- typing indicators
- presence updates
- live notifications
- unread updates

## Deployment

This backend can be deployed to:

- Render
- Railway

Recommended production setup:

- MongoDB Atlas
- secure JWT secrets
- `COOKIE_SECURE=true`
- `CLIENT_URL` set to frontend domain
- `NODE_ENV=production`

## Notes

- Do not commit `.env`
- Do not commit secrets or API keys
- Make sure MongoDB is running before starting the server
