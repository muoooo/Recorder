# RoomLink

Real-time rooms with Socket.io + Express. People enter their name, create or join a room, and see everyone in it live.

## Project structure

```
roomlink-server/
├── server.js          ← Node.js backend (Express + Socket.io)
├── package.json
└── public/
    └── index.html     ← Frontend (served by the server)
```

## Deploy to Render (free)

1. Push this entire folder to a GitHub repo (can be the root of the repo).
2. Go to https://render.com → **New** → **Web Service**
3. Connect your GitHub repo
4. Fill in these settings:
   - **Environment**: `Node`
   - **Build command**: `npm install`
   - **Start command**: `node server.js`
   - **Instance type**: Free
5. Click **Deploy** — Render gives you a URL like `https://yourapp.onrender.com`

> ⚠️ Free web services on Render sleep after 15 min of no traffic.
> First visitor after idle gets a ~30–60 sec cold start. Fine for testing.

## Run locally

```bash
npm install
node server.js
# open http://localhost:3000
```
