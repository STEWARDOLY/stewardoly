# 🏛 Kingdom Steward — Deployment Guide

A gamified, live-multiplayer biblical stewardship board game built with Node.js + Socket.io.

**Gamification features:**
- 🎯 **XP & Levels** — every action earns XP, level up with fanfare
- 🏆 **12 Achievements** — First Tithe, Builder, Combo x3, Kingdom Heir, and more
- 🎁 **Daily Quests** — live progress bars for micro-goals
- 🔥 **Combo system** — chain rewards for bonus feedback
- ✨ **Juicy feedback** — particle bursts, coin pops, animated dice, sound effects
- 🎓 **Coach-mark tutorial** — interactive onboarding with spotlights

---

## ⚡ Deploy in 3 Minutes (Railway — Recommended)

Railway offers a generous free tier — perfect for church and classroom use.

### Step 1 — Push to GitHub
```bash
cd kingdom-steward
git init
git add .
git commit -m "Kingdom Steward v1.0"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/kingdom-steward.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to **railway.app** and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `kingdom-steward` repo
4. Railway auto-detects Node.js and deploys — no config needed
5. Click **"Generate Domain"** to get your public URL
6. Share the URL with your church group or classroom!

---

## 🌐 Deploy on Render (Also Free)

1. Go to **render.com** → New → **Web Service**
2. Connect your GitHub repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Click **Create Web Service**
5. Your URL: `https://kingdom-steward-xxxx.onrender.com`

> Note: Render free tier spins down after 15 min of inactivity. 
> Upgrade to Starter ($7/mo) for always-on hosting for your church.

---

## 🖥 Run Locally

```bash
# 1. Install dependencies
cd kingdom-steward
npm install

# 2. Start the server
npm start

# 3. Open in browser
open http://localhost:3000
```

For hot-reload during development:
```bash
npm run dev
```

---

## 🎮 How Multiplayer Works

### For the Host (Teacher / Facilitator)
1. Open the game URL
2. Enter your name and click **"Create Room"**
3. Share the **4-letter Room Code** with players
4. Wait for players to join — you'll see them appear in the lobby
5. Click **"Start Journey"** when everyone is ready
6. You control Player 1's turn; others take their turns in sequence

### For Players
1. Open the same game URL on your phone/tablet
2. Enter your name, choose a token
3. Type the Room Code and click **"Join"**
4. Wait in the lobby — the host starts the game
5. When it's your turn, the controls activate automatically
6. Other players watch your token move in real time!

### For Classrooms / Churches (Projector Mode)
- Display the game on a projector from one computer
- Each student joins on their own phone
- The facilitator controls the pace and discussion
- The chat panel lets players send messages during gameplay

---

## 🏗 Architecture

```
kingdom-steward/
├── src/
│   └── server.js          # Express + Socket.io server
│                           # All game logic runs server-side
│                           # Room management, state sync
│                           # Authoritative dice rolls
├── public/
│   └── index.html         # Complete frontend (single file)
│                           # Canvas map rendering
│                           # Socket.io real-time client
│                           # Web Audio sound engine
│                           # Tutorial walkthrough
├── package.json
└── DEPLOY.md
```

### Key Design Decisions
- **Server-authoritative**: Dice rolls happen on the server to prevent cheating
- **Room-based**: Up to 6 players per room; rooms auto-clean after 6 hours  
- **Reconnection-safe**: Players who disconnect can rejoin and resume
- **No database needed**: Game state lives in server memory (perfect for sessions)

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT`   | `3000`  | Server port (auto-set by Railway/Render) |

---

## 📱 Tested On
- iPhone Safari (iOS 15+)
- Android Chrome
- iPad (landscape & portrait)
- Desktop Chrome, Firefox, Safari, Edge
- Classroom projectors (1080p)

---

## 🌿 Business Model Integration

The game supports the subscription tiers described in your book:

| Tier | Setup |
|------|-------|
| **Free (Seed)** | Deploy as-is — share the URL |
| **Congregation ($12/mo)** | Add a login page + persistent rooms |
| **Classroom ($8/mo)** | Add teacher dashboard (score export) |
| **Kingdom Builder ($49/mo)** | White-label: change colors/logo in `index.html` |

For paid tiers, add:
- **Stripe** for subscriptions (`npm install stripe`)
- **MongoDB Atlas** (free tier) for persistent game history
- **Auth0** (free tier) for user accounts

---

## 📖 Customization

### Change the game title / branding
Edit `public/index.html` — search for "Kingdom Steward" and replace.

### Add more card content
Edit `src/server.js` → find the `CARDS` object → add entries to any deck.

### Add more spaces
Edit both `src/server.js` and `public/index.html` → find the `SPACES` array.
Both must stay in sync (same order, same length).

### Change colors
The color palette is in the CSS `:root` section at the top of `index.html`.

---

*"The earth is the Lord's, and everything in it." — Psalm 24:1*

Built with ♥ for churches, classrooms, and families.
