const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ─── GAME DATA ───────────────────────────────────────────────────────────────

const SPACES = [
  { n: 'Begin',        t: 'corner',   rx: .50, ry: .08, c: '#c9922a' },
  { n: 'Capernaum',    t: 'property', rx: .60, ry: .09, c: '#2d9e8a' },
  { n: 'Bethsaida',    t: 'property', rx: .68, ry: .11, c: '#2d9e8a' },
  { n: 'Scroll',       t: 'card-w',   rx: .76, ry: .15, c: '#7a5ab5' },
  { n: 'Antioch',      t: 'property', rx: .82, ry: .20, c: '#7a5ab5' },
  { n: 'Babylon Gate', t: 'property', rx: .86, ry: .28, c: '#c03a1a' },
  { n: 'Temptation',   t: 'special',  rx: .87, ry: .36, c: '#c03a1a' },
  { n: 'Babylon Ct',   t: 'property', rx: .86, ry: .44, c: '#c03a1a' },
  { n: 'Jordan Ford',  t: 'property', rx: .82, ry: .51, c: '#3a7ab5' },
  { n: 'Decapolis',    t: 'property', rx: .78, ry: .58, c: '#3a7ab5' },
  { n: 'Wilderness',   t: 'corner',   rx: .72, ry: .63, c: '#8a6a3a' },
  { n: 'Peraea',       t: 'property', rx: .65, ry: .67, c: '#8a6a40' },
  { n: 'Tithe',        t: 'tax',      rx: .58, ry: .71, c: '#c9922a' },
  { n: 'Machaerus',    t: 'property', rx: .51, ry: .74, c: '#8a6a40' },
  { n: 'Scroll',       t: 'card-w',   rx: .44, ry: .76, c: '#7a5ab5' },
  { n: 'Dead Sea N',   t: 'property', rx: .37, ry: .77, c: '#1a5a7a' },
  { n: 'Dead Sea S',   t: 'property', rx: .30, ry: .76, c: '#1a5a7a' },
  { n: 'Acts',         t: 'card-a',   rx: .24, ry: .73, c: '#2d8a5a' },
  { n: 'Temptation',   t: 'special',  rx: .18, ry: .69, c: '#c03a1a' },
  { n: 'Negev',        t: 'property', rx: .13, ry: .64, c: '#c8a060' },
  { n: 'Jubilee',      t: 'corner',   rx: .10, ry: .58, c: '#c9922a' },
  { n: 'Nile Trade',   t: 'property', rx: .09, ry: .51, c: '#3a8a5a' },
  { n: 'Sinai',        t: 'property', rx: .08, ry: .44, c: '#c88040' },
  { n: 'Tithe',        t: 'tax',      rx: .09, ry: .37, c: '#c9922a' },
  { n: 'Parable',      t: 'card-p',   rx: .10, ry: .30, c: '#3a7ab5' },
  { n: 'Hebron',       t: 'property', rx: .13, ry: .24, c: '#9a7040' },
  { n: 'Acts',         t: 'card-a',   rx: .17, ry: .18, c: '#2d8a5a' },
  { n: 'Judea Hills',  t: 'property', rx: .22, ry: .13, c: '#9a7040' },
  { n: 'Nazareth',     t: 'property', rx: .28, ry: .09, c: '#4a8a3a' },
  { n: 'Mt Carmel',    t: 'property', rx: .35, ry: .07, c: '#4a8a3a' },
  { n: 'Temple',       t: 'corner',   rx: .50, ry: .42, c: '#c9922a' },
  { n: 'Jerusalem',    t: 'property', rx: .42, ry: .37, c: '#e8b840' },
  { n: 'Zion Gate',    t: 'property', rx: .38, ry: .30, c: '#e8b840' },
  { n: 'Scroll',       t: 'card-w',   rx: .34, ry: .24, c: '#7a5ab5' },
  { n: 'Samaria',      t: 'property', rx: .30, ry: .19, c: '#9a8a40' },
  { n: 'Sychar',       t: 'property', rx: .27, ry: .14, c: '#9a8a40' },
  { n: 'Mt Gerizim',   t: 'property', rx: .36, ry: .17, c: '#9a8a40' },
  { n: 'Temptation',   t: 'special',  rx: .43, ry: .21, c: '#c03a1a' },
  { n: 'Acts',         t: 'card-a',   rx: .48, ry: .28, c: '#2d8a5a' },
  { n: 'Tiberias',     t: 'property', rx: .52, ry: .33, c: '#2d9e8a' },
];

const CARDS = {
  'card-w': [
    { icon: '📜', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'The Generous Lender', body: 'You lend to many and borrow from none. Receive 150 Talents.', verse: '"You will lend to many nations but will borrow from none." — Deut 28:12', fx: 150 },
    { icon: '📜', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Wisdom above Silver', body: 'Seek understanding first. Gain 100 Talents and 1 Wisdom Card.', verse: '"Choose my instruction instead of silver." — Prov 8:10', fx: 100 },
    { icon: '📜', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Diligent Hands Rule', body: 'Your faithful work multiplies. Receive 80 Talents.', verse: '"Diligent hands will rule, but laziness ends in toil." — Prov 12:24', fx: 80 },
    { icon: '📜', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Give and It Returns', body: 'Your generosity multiplied! Gain 120 Talents.', verse: '"Give, and it will be given to you." — Luke 6:38', fx: 120 },
  ],
  'card-a': [
    { icon: '🤝', badge: 'Acts of Apostles', bcls: 'ba', title: 'All Things in Common', body: 'Give 60 Talents to the player with fewest. Love costs something.', verse: '"All the believers had everything in common." — Acts 2:44', fx: -60, communal: true },
    { icon: '🤝', badge: 'Acts of Apostles', bcls: 'ba', title: 'Barnabas Encourages', body: 'A life-giving word spoken over you! Gain 70 Talents.', verse: '"He was a good man, full of the Holy Spirit." — Acts 11:24', fx: 70 },
    { icon: '🤝', badge: 'Acts of Apostles', bcls: 'ba', title: "Lydia's Hospitality", body: 'Generous hospitality! All players gain 40T from the Tithe Pool.', verse: '"She opened her home to us." — Acts 16:15', fx: 40, allPlayers: true },
    { icon: '🤝', badge: 'Acts of Apostles', bcls: 'ba', title: 'Paul Plants a Church', body: 'A new ministry springs up! Gain 1 free Ministry at your space.', verse: '"I planted the seed, Apollos watered it." — 1 Cor 3:6', fx: 0, freeMinistry: true },
  ],
  'card-p': [
    { icon: '❓', badge: 'Parable Challenge', bcls: 'bp', title: 'Parable of the Talents', body: 'Which servant was praised? The ones who invested their talents. Answer correctly: +100T!', verse: 'Matthew 25:14–30', fx: 100 },
    { icon: '❓', badge: 'Parable Challenge', bcls: 'bp', title: 'Zacchaeus', body: 'What did Zacchaeus promise? Half his wealth + 4x repayment for cheating. Correct = +80T!', verse: 'Luke 19:1–10', fx: 80 },
    { icon: '❓', badge: 'Parable Challenge', bcls: 'bp', title: "The Widow's Offering", body: 'Why did the widow give more? She gave everything she had. Correct = +120T!', verse: 'Mark 12:41–44', fx: 120 },
  ],
  'special': [
    { icon: '🐍', badge: 'Temptation', bcls: 'bt', title: 'Love of Money', body: 'The lure of hoarding whispers. Lose 80T — idols cost more than they pay.', verse: '"The love of money is a root of all kinds of evil." — 1 Tim 6:10', fx: -80 },
    { icon: '🏜️', badge: 'Wilderness', bcls: 'bt', title: 'Desert Testing', body: 'A season of trial. Lose a turn but gain 1 Wisdom Card — deserts form character.', verse: '"I will lead her into the wilderness and speak tenderly." — Hos 2:14', fx: 0 },
    { icon: '🧂', badge: 'Bitter Waters', bcls: 'bt', title: 'Dead Sea Toll', body: 'A difficult crossing! Pay 60T to the Tithe Pool as a gratitude offering.', verse: '"Even through the valley, I fear no evil." — Psalm 23:4', fx: -60 },
  ],
};

// ─── ROOM MANAGEMENT ─────────────────────────────────────────────────────────

const rooms = new Map(); // roomCode -> gameState

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom(hostId, hostName, hostToken) {
  const code = generateCode();
  const state = {
    code,
    hostId,
    phase: 'lobby',      // lobby | playing | ended
    players: [{
      id: hostId,
      name: hostName || 'Pilgrim',
      icon: hostToken.icon,
      color: hostToken.color,
      role: hostToken.role,
      pos: 0,
      talents: 1500,
      ministries: 0,
      titheTokens: 0,
      wisdomCards: 0,
      owned: [],
      skipTurn: false,
      connected: true,
    }],
    currentPlayerIndex: 0,
    round: 1,
    tithePool: 200,
    rolled: false,
    log: ['✦ Room created. Share the code to invite pilgrims!'],
    pendingCard: null,
    createdAt: Date.now(),
  };
  rooms.set(code, state);
  return state;
}

function getPublicState(state) {
  return {
    code: state.code,
    phase: state.phase,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    round: state.round,
    tithePool: state.tithePool,
    rolled: state.rolled,
    log: state.log.slice(-20),
    pendingCard: state.pendingCard,
  };
}

function addLog(state, msg) {
  state.log.push(msg);
  if (state.log.length > 100) state.log.shift();
}

function broadcastState(roomCode) {
  const state = rooms.get(roomCode);
  if (!state) return;
  io.to(roomCode).emit('state', getPublicState(state));
}

function pickCard(type) {
  const deck = CARDS[type] || CARDS['special'];
  return deck[Math.floor(Math.random() * deck.length)];
}

// ─── GAME LOGIC ───────────────────────────────────────────────────────────────

function processRoll(state, d1, d2) {
  const total = d1 + d2;
  const pi = state.currentPlayerIndex;
  const p = state.players[pi];
  const oldPos = p.pos;
  const newPos = (p.pos + total) % 40;
  p.pos = newPos;
  state.rolled = true;

  addLog(state, `${p.name} rolled ${d1}+${d2}=${total} → ${SPACES[newPos].n}`);

  // Passed Begin
  if (newPos <= oldPos && oldPos !== 0) {
    p.talents += 200;
    const tithe = Math.floor(200 * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    addLog(state, `${p.name} passed Begin — collected 200T, tithed ${tithe}T`);
  }

  // Trigger space
  const sp = SPACES[newPos];
  let cardDrawn = null;

  if (sp.t === 'tax') {
    const tithe = Math.floor(p.talents * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    addLog(state, `${p.name} tithed ${tithe}T ⚖`);
  } else if (sp.t === 'corner') {
    handleCorner(state, p, newPos);
  } else if (CARDS[sp.t] || sp.t === 'special') {
    const cardType = sp.t === 'special' ? 'special' : sp.t;
    cardDrawn = pickCard(cardType);
    state.pendingCard = { ...cardDrawn, drawerId: p.id };
    addLog(state, `${p.name} drew: ${cardDrawn.title}`);
  }

  return { roll: [d1, d2], cardDrawn };
}

function handleCorner(state, p, pos) {
  if (pos === 10) {
    addLog(state, `${p.name} enters the Wilderness — resting and gaining wisdom`);
    p.wisdomCards++;
    p.skipTurn = true;
  } else if (pos === 20) {
    const tithe = Math.floor(p.talents * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    addLog(state, `${p.name} at the Temple — tithed ${tithe}T`);
  } else if (pos === 30) {
    const active = state.players.filter(pl => pl.connected);
    const share = Math.floor(state.tithePool / active.length);
    active.forEach(pl => pl.talents += share);
    state.tithePool = 200;
    addLog(state, `✨ Year of Jubilee! Each pilgrim received ${share}T!`);
  }
}

function applyCard(state, accepted) {
  const card = state.pendingCard;
  if (!card) return;
  const p = state.players[state.currentPlayerIndex];

  if (accepted) {
    if (card.fx > 0) {
      p.talents += card.fx;
      p.wisdomCards++;
      addLog(state, `${p.name} gained ${card.fx}T ✦`);
    } else if (card.fx < 0) {
      p.talents = Math.max(0, p.talents + card.fx);
      addLog(state, `${p.name} paid ${Math.abs(card.fx)}T`);
    }
    if (card.freeMinistry && !p.owned.includes(p.pos) && SPACES[p.pos].t === 'property') {
      p.ministries++;
      p.owned.push(p.pos);
      addLog(state, `${p.name} built a free Ministry!`);
    }
    if (card.allPlayers && card.fx > 0) {
      state.players.filter(pl => pl.id !== p.id && pl.connected).forEach(pl => {
        pl.talents += card.fx;
      });
      addLog(state, `All pilgrims received ${card.fx}T from Lydia's hospitality!`);
    }
    if (card.communal && card.fx < 0) {
      const poorest = state.players.filter(pl => pl.id !== p.id && pl.connected)
        .sort((a, b) => a.talents - b.talents)[0];
      if (poorest) {
        poorest.talents += Math.abs(card.fx);
        addLog(state, `${poorest.name} received ${Math.abs(card.fx)}T from ${p.name}`);
      }
    }
  } else {
    addLog(state, `${p.name} skipped the card`);
  }
  state.pendingCard = null;
}

function buyMinistry(state) {
  const p = state.players[state.currentPlayerIndex];
  const sp = SPACES[p.pos];
  if (sp.t !== 'property') return { err: 'Can only buy property spaces!' };
  if (p.owned.includes(p.pos)) return { err: 'You already own this ministry!' };
  if (p.talents < 200) return { err: 'Need 200 Talents to build a ministry.' };
  p.talents -= 200;
  p.ministries++;
  p.owned.push(p.pos);
  addLog(state, `${p.name} built a Ministry at ${sp.n}! 🏛`);
  return { ok: true };
}

function endTurn(state) {
  const active = state.players.filter(p => p.connected);
  const cur = state.players[state.currentPlayerIndex];

  // Handle skip turn (Wilderness)
  if (cur.skipTurn) {
    cur.skipTurn = false;
  }

  const curActiveIdx = active.indexOf(cur);
  const nextActive = active[(curActiveIdx + 1) % active.length];
  state.currentPlayerIndex = state.players.indexOf(nextActive);
  if (state.currentPlayerIndex === state.players.findIndex(p => p.connected)) {
    state.round++;
  }
  state.rolled = false;
  state.pendingCard = null;
  addLog(state, `${nextActive.name}'s turn begins ✦`);
}

function calcScore(p) {
  return Math.floor(p.talents / 100) + p.ministries * 5 + p.wisdomCards * 3 + p.titheTokens * 2;
}

// ─── SOCKET EVENTS ────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Create a new room
  socket.on('create_room', ({ name, token }, cb) => {
    try {
      const state = createRoom(socket.id, name, token);
      socket.join(state.code);
      socket.data.roomCode = state.code;
      socket.data.playerId = socket.id;
      console.log(`Room ${state.code} created by ${name}`);
      cb({ ok: true, code: state.code, state: getPublicState(state) });
    } catch (e) {
      cb({ ok: false, err: e.message });
    }
  });

  // Join an existing room
  socket.on('join_room', ({ code, name, token }, cb) => {
    const state = rooms.get(code.toUpperCase());
    if (!state) return cb({ ok: false, err: 'Room not found. Check the code and try again.' });

    // Try to reconnect as existing player (by name match, case-insensitive)
    const trimmedName = (name || '').trim();
    const existing = state.players.find(p =>
      p.name.toLowerCase() === trimmedName.toLowerCase() && !p.connected
    );

    if (existing) {
      // Reconnection — restore the player's spot and update their socket.id
      existing.id = socket.id;
      existing.connected = true;
      addLog(state, `${existing.name} rejoined the room ✦`);
      socket.join(code.toUpperCase());
      socket.data.roomCode = code.toUpperCase();
      socket.data.playerId = socket.id;
      // If it's their turn, update the currentPlayerIndex (by finding them again)
      broadcastState(code.toUpperCase());
      return cb({ ok: true, code: code.toUpperCase(), state: getPublicState(state), reconnected: true });
    }

    // Block new joins if game is already playing
    if (state.phase === 'playing') {
      return cb({ ok: false, err: 'Game already in progress. Use your original name to rejoin.' });
    }

    // Check name not already taken by connected player
    const nameTaken = state.players.find(p =>
      p.name.toLowerCase() === trimmedName.toLowerCase() && p.connected
    );
    if (nameTaken) return cb({ ok: false, err: `Name "${trimmedName}" is already taken. Choose another.` });

    // Check token not already taken
    const takenIcon = state.players.find(p => p.icon === token.icon && p.connected);
    if (takenIcon) return cb({ ok: false, err: `${token.icon} is already taken. Choose another hero.` });

    // New player joining
    state.players.push({
      id: socket.id,
      name: trimmedName || 'Pilgrim',
      icon: token.icon,
      color: token.color,
      role: token.role,
      pos: 0,
      talents: 1500,
      ministries: 0,
      titheTokens: 0,
      wisdomCards: 0,
      owned: [],
      skipTurn: false,
      connected: true,
    });
    addLog(state, `${trimmedName} joined the room ✦`);

    socket.join(code.toUpperCase());
    socket.data.roomCode = code.toUpperCase();
    socket.data.playerId = socket.id;
    broadcastState(code.toUpperCase());
    cb({ ok: true, code: code.toUpperCase(), state: getPublicState(state) });
  });

  // Host starts the game
  socket.on('start_game', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false, err: 'Room not found' });
    if (socket.id !== state.hostId) return cb?.({ ok: false, err: 'Only the host can start the game.' });
    if (state.players.filter(p => p.connected).length < 2) return cb?.({ ok: false, err: 'Need at least 2 players to start.' });
    state.phase = 'playing';
    state.currentPlayerIndex = 0;
    addLog(state, '✦ The Kingdom journey begins! May wisdom guide your steps.');
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  // Roll dice (server authoritative)
  socket.on('roll', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false, err: 'Room not found' });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "It's not your turn." });
    if (state.rolled) return cb?.({ ok: false, err: 'Already rolled this turn.' });
    if (state.phase !== 'playing') return cb?.({ ok: false, err: 'Game not started.' });

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const result = processRoll(state, d1, d2);
    broadcastState(state.code);
    io.to(state.code).emit('dice_rolled', { playerId: socket.id, d1, d2 });
    if (result.cardDrawn) {
      io.to(state.code).emit('card_drawn', { card: result.cardDrawn });
    }
    cb?.({ ok: true, d1, d2 });
  });

  // Apply or skip card
  socket.on('apply_card', ({ accepted }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    applyCard(state, accepted);
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  // Buy a ministry
  socket.on('buy_ministry', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    const result = buyMinistry(state);
    broadcastState(state.code);
    cb?.(result);
  });

  // End turn
  socket.on('end_turn', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    endTurn(state);
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  // Chat message
  socket.on('chat', ({ msg }) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return;
    const p = state.players.find(pl => pl.id === socket.id);
    if (!p) return;
    const clean = String(msg).slice(0, 120).replace(/</g, '&lt;');
    io.to(state.code).emit('chat', { name: p.name, icon: p.icon, msg: clean });
  });

  // Request current state (reconnection)
  socket.on('get_state', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    cb?.({ ok: true, state: getPublicState(state) });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const state = rooms.get(code);
    if (!state) return;
    const p = state.players.find(pl => pl.id === socket.id);
    if (p) {
      p.connected = false;
      addLog(state, `${p.name} left — can rejoin with same name & code`);
      broadcastState(code);
    }
    console.log('Disconnected:', socket.id);
  });
});

// ─── CLEANUP ─────────────────────────────────────────────────────────────────
// Remove rooms older than 6 hours
setInterval(() => {
  const sixHours = 6 * 60 * 60 * 1000;
  for (const [code, state] of rooms) {
    if (Date.now() - state.createdAt > sixHours) {
      rooms.delete(code);
      console.log(`Cleaned up room ${code}`);
    }
  }
}, 30 * 60 * 1000);

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🏛  Kingdom Steward server running on port ${PORT}`);
  console.log(`   Open http://localhost:${PORT} to play\n`);
});
