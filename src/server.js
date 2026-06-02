// ═══════════════════════════════════════════════════════════════
// STEWARDOLY — Server
// Biblical board game with multiplayer (Socket.IO)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(express.static(path.join(__dirname, '..', 'public')));

// ═══════════════════════════════════════════════════════════════
// 40-SPACE BOARD
// ═══════════════════════════════════════════════════════════════
const SPACES = [
  { n: 'Begin',          t: 'corner',   rx: 0.96, ry: 0.96 },
  { n: 'Capernaum',      t: 'property', rx: 0.86, ry: 0.96 },
  { n: 'Wisdom',         t: 'card-w',   rx: 0.78, ry: 0.96 },
  { n: 'Bethsaida',      t: 'property', rx: 0.70, ry: 0.96 },
  { n: 'Tithe',          t: 'tax',      rx: 0.62, ry: 0.96 },
  { n: 'Antioch',        t: 'property', rx: 0.54, ry: 0.96 },
  { n: 'Acts',           t: 'card-a',   rx: 0.46, ry: 0.96 },
  { n: 'Babylon Gate',   t: 'property', rx: 0.38, ry: 0.96 },
  { n: 'Babylon Ct',     t: 'property', rx: 0.30, ry: 0.96 },
  { n: 'Temptation',     t: 'special',  rx: 0.22, ry: 0.96 },
  { n: 'Wilderness',     t: 'corner',   rx: 0.04, ry: 0.96 },
  { n: 'Jordan Ford',    t: 'property', rx: 0.04, ry: 0.86 },
  { n: 'Parable',        t: 'card-p',   rx: 0.04, ry: 0.78 },
  { n: 'Decapolis',      t: 'property', rx: 0.04, ry: 0.70 },
  { n: 'Peraea',         t: 'property', rx: 0.04, ry: 0.62 },
  { n: 'Wisdom',         t: 'card-w',   rx: 0.04, ry: 0.54 },
  { n: 'Machaerus',      t: 'property', rx: 0.04, ry: 0.46 },
  { n: 'Dead Sea N',     t: 'property', rx: 0.04, ry: 0.38 },
  { n: 'Acts',           t: 'card-a',   rx: 0.04, ry: 0.30 },
  { n: 'Dead Sea S',     t: 'property', rx: 0.04, ry: 0.22 },
  { n: 'Temple',         t: 'corner',   rx: 0.04, ry: 0.04 },
  { n: 'Negev',          t: 'property', rx: 0.14, ry: 0.04 },
  { n: 'Parable',        t: 'card-p',   rx: 0.22, ry: 0.04 },
  { n: 'Nile Trade',     t: 'property', rx: 0.30, ry: 0.04 },
  { n: 'Sinai',          t: 'property', rx: 0.38, ry: 0.04 },
  { n: 'Tithe',          t: 'tax',      rx: 0.46, ry: 0.04 },
  { n: 'Hebron',         t: 'property', rx: 0.54, ry: 0.04 },
  { n: 'Wisdom',         t: 'card-w',   rx: 0.62, ry: 0.04 },
  { n: 'Judea Hills',    t: 'property', rx: 0.70, ry: 0.04 },
  { n: 'Nazareth',       t: 'property', rx: 0.78, ry: 0.04 },
  { n: 'Mt Carmel',      t: 'corner',   rx: 0.96, ry: 0.04 },
  { n: 'Jerusalem',      t: 'property', rx: 0.96, ry: 0.14 },
  { n: 'Acts',           t: 'card-a',   rx: 0.96, ry: 0.22 },
  { n: 'Zion Gate',      t: 'property', rx: 0.96, ry: 0.30 },
  { n: 'Samaria',        t: 'property', rx: 0.96, ry: 0.38 },
  { n: 'Temptation',     t: 'special',  rx: 0.96, ry: 0.46 },
  { n: 'Sychar',         t: 'property', rx: 0.96, ry: 0.54 },
  { n: 'Mt Gerizim',     t: 'property', rx: 0.96, ry: 0.62 },
  { n: 'Parable',        t: 'card-p',   rx: 0.96, ry: 0.70 },
  { n: 'Tiberias',       t: 'property', rx: 0.96, ry: 0.86 },
];

// ═══════════════════════════════════════════════════════════════
// CARDS — REDESIGNED for fairness and moral weight
// Temptation cards FLIP: Accept = Talents (compromise), Decline = Virtue (character)
// Communal/giving cards reward MORE Virtue (since they cost real money)
// Trivia: Skip costs -1 VP (lazy mind); correct = VP based on difficulty
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// CARDS — with rarity system: common (60%), rare (25%), epic (12%), legendary (3%)
// Cards have a `rarity` field used for weighted random draw.
// ═══════════════════════════════════════════════════════════════
const CARDS = {
  'card-w': [
    // ─── COMMON (everyday blessings) ───
    { rarity:'common', icon: '🍞', badge: 'Scroll of Wisdom', title: 'Daily Bread', body: 'Daily needs met. Collect 90 Talents.', verse: 'Matt 6:11', fx: 90 },
    { rarity:'common', icon: '🎵', badge: 'Scroll of Wisdom', title: "David's Song", body: 'Joy! Gain 70 Talents.', verse: 'Psalm 23', fx: 70 },
    { rarity:'common', icon: '💧', badge: 'Scroll of Wisdom', title: 'Well of Provision', body: 'Living water provides! Gain 120 Talents.', verse: 'John 4:14', fx: 120 },
    { rarity:'common', icon: '🌳', badge: 'Scroll of Wisdom', title: 'Tree by Living Water', body: 'Deeply rooted! Gain 100T.', verse: 'Psalm 1:3', fx: 100 },
    { rarity:'common', icon: '📜', badge: 'Scroll of Wisdom', title: 'The Generous Lender', body: 'You lent to many. Walk forward 3 spaces, +150T.', verse: 'Deut 28:12', fx: 150, advance: 3, vp: 1 },
    { rarity:'common', icon: '🦅', badge: 'Scroll of Wisdom', title: "Soar on Eagles' Wings", body: 'Strength renewed! Advance to nearest Wisdom space, +50T.', verse: 'Isaiah 40:31', fx: 50, advance: 'wisdom' },
    // ─── RARE ───
    { rarity:'rare', icon: '🌾', badge: 'Scroll of Wisdom', title: 'Year of Abundance', body: 'Bumper harvest! Gain 50T per ministry you own.', verse: 'Lev 26:4', fx: 0, perMinistry: 50 },
    { rarity:'rare', icon: '🕊️', badge: 'Scroll of Wisdom', title: 'Peace Be With You', body: 'All players give you 20T.', verse: 'John 14:27', fx: 0, fromAll: 20 },
    { rarity:'rare', icon: '👑', badge: 'Scroll of Wisdom', title: 'King Solomon Visits', body: "Solomon's wisdom! +180T, +1 Wisdom.", verse: '1 Kings 3:9', fx: 180, wisdom: 1 },
    { rarity:'rare', icon: '🌟', badge: 'Scroll of Wisdom', title: 'Star of Bethlehem', body: 'Advance to the Temple corner.', verse: 'Matt 2:9', fx: 0, advanceToCorner: 20 },
    { rarity:'rare', icon: '🍇', badge: 'Scroll of Wisdom', title: 'Mustard Seed Faith', body: 'Plant a seed. Gain 20T per ministry every future round.', verse: 'Matt 17:20', fx: 0, plantMustardSeed: 20 },
    { rarity:'rare', icon: '⚜️', badge: 'Scroll of Wisdom', title: 'Anointing Oil', body: 'Convert worldly to eternal — pay 50T, gain 3 Virtue.', verse: '1 Sam 16:13', fx: -50, vp: 3 },
    // ─── EPIC (board-changing) ───
    { rarity:'epic', icon: '🌊', badge: 'Scroll of Wisdom', title: 'Crossing the Red Sea', body: 'Move forward 7 spaces, ignoring all effects in between.', verse: 'Exodus 14:21', fx: 0, sprint: 7 },
    { rarity:'epic', icon: '👣', badge: 'Scroll of Wisdom', title: 'Walking on Water', body: 'Until your next turn, your dice roll is DOUBLED.', verse: 'Matt 14:25', fx: 0, doubleNextRoll: true },
    { rarity:'epic', icon: '🛡️', badge: 'Scroll of Wisdom', title: "Daniel's Den", body: 'Immune to next 2 temptations and penalties.', verse: 'Daniel 6:22', fx: 0, shield: 2 },
    { rarity:'epic', icon: '🌅', badge: 'Scroll of Wisdom', title: 'Promised Land', body: 'Move directly to the next corner space.', verse: 'Deut 8:7', fx: 0, advanceToNextCorner: true },
    // ─── LEGENDARY (game-changing) ───
    { rarity:'legendary', icon: '🌈', badge: '⭐ Scroll of Wisdom', title: "Noah's Covenant", body: 'God remembers His promise. +400T and +5 Virtue.', verse: 'Genesis 9:13', fx: 400, vp: 5 },
    { rarity:'legendary', icon: '🔥', badge: '⭐ Scroll of Wisdom', title: 'Pentecost', body: 'Draw 3 Wisdom cards, keep all of them.', verse: 'Acts 2:4', fx: 0, drawAndKeep: 3 },
    { rarity:'legendary', icon: '🎉', badge: '⭐ Scroll of Wisdom', title: 'Year of Jubilee', body: 'All debts forgiven! Each player with under 200T gets to 500T. You gain +5 Virtue.', verse: 'Lev 25:10', fx: 0, jubilee: true, vp: 5 },
  ],
  'card-a': [
    // ─── COMMON ───
    { rarity:'common', icon: '💬', badge: 'Acts of Apostles', title: 'Barnabas Encourages', body: 'Life-giving words! Gain 70T.', verse: 'Acts 11:24', fx: 70 },
    { rarity:'common', icon: '🏺', badge: 'Acts of Apostles', title: "Widow's Oil Multiplied", body: 'Faith pays! Gain 80T.', verse: '2 Kings 4:1-7', fx: 80 },
    { rarity:'common', icon: '🐟', badge: 'Acts of Apostles', title: 'Loaves & Fishes', body: 'Multiplication miracle! Gain up to 200T (double your wallet, capped at 200).', verse: 'John 6:1-13', fx: 0, doubleUpTo: 200 },
    { rarity:'common', icon: '🌿', badge: 'Acts of Apostles', title: 'Wash Their Feet', body: 'Each player gives you 25T.', verse: 'John 13:14', fx: 0, fromAll: 25, vp: 1 },
    // ─── RARE ───
    { rarity:'rare', icon: '🤝', badge: 'Acts of Apostles', title: 'All Things in Common', body: 'Give 60T to the poorest player. +3 Virtue.', verse: 'Acts 2:44', fx: -60, communal: true, vp: 3 },
    { rarity:'rare', icon: '🏠', badge: 'Acts of Apostles', title: "Lydia's Hospitality", body: 'All players gain 40T from the Tithe Pool. +2 Virtue.', verse: 'Acts 16:15', fx: 40, allPlayers: true, vp: 2 },
    { rarity:'rare', icon: '🍇', badge: 'Acts of Apostles', title: 'Vineyard Workers', body: 'Each player receives 30T.', verse: 'Matt 20:1-16', fx: 30, allPlayers: true, vp: 1 },
    { rarity:'rare', icon: '🦴', badge: 'Acts of Apostles', title: 'The Good Samaritan', body: 'Pay 50T to the poorest player. +3 Virtue.', verse: 'Luke 10:25-37', fx: -50, communal: true, vp: 3 },
    { rarity:'rare', icon: '🎁', badge: 'Acts of Apostles', title: 'Mission Offering', body: 'Pay 40T to Tithe Pool. +2 Virtue, +1 Wisdom.', verse: '2 Cor 9:7', fx: -40, toTithePool: true, vp: 2, wisdom: 1 },
    { rarity:'rare', icon: '🍞', badge: 'Acts of Apostles', title: 'Manna from Heaven', body: 'Each player gains 50T from the Tithe Pool.', verse: 'Exodus 16:4', fx: 0, mannaFromTithe: 50 },
    // ─── EPIC ───
    { rarity:'epic', icon: '⛪', badge: 'Acts of Apostles', title: 'Paul Plants a Church', body: 'Free Ministry at your space (if eligible)!', verse: '1 Cor 3:6', fx: 0, freeMinistry: true },
    { rarity:'epic', icon: '⚰️', badge: 'Acts of Apostles', title: 'Lazarus Rises', body: 'If you have less than 100T, instantly gain 250T.', verse: 'John 11:43', fx: 0, lazarus: true },
    { rarity:'epic', icon: '🌿', badge: 'Acts of Apostles', title: 'Healing at Bethesda', body: 'Remove any skip-turn or penalty effect on you. +2 Virtue.', verse: 'John 5:8', fx: 0, healAll: true, vp: 2 },
    // ─── LEGENDARY ───
    { rarity:'legendary', icon: '👼', badge: '⭐ Acts of Apostles', title: "Esther's Courage", body: "'For such a time as this.' Steal 100T from the richest player.", verse: 'Esther 4:14', fx: 0, stealFromRichest: 100, vp: 2 },
    { rarity:'legendary', icon: '✝️', badge: '⭐ Acts of Apostles', title: 'The Risen Lord', body: 'Heart filled with hope! +350T, +6 Virtue, +2 Wisdom.', verse: 'Matt 28:6', fx: 350, vp: 6, wisdom: 2 },
  ],
  'card-p': [
    // ─── TRIVIA — Easy (common) ───
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'How many disciples did Jesus call?', options: ['7', '12', '40'], correct: 1, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'Who built the ark?', options: ['Moses', 'Noah', 'Abraham'], correct: 1, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'What did David use to defeat Goliath?', options: ['Sword', 'Sling and stone', 'Spear'], correct: 1, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'In what city was Jesus born?', options: ['Jerusalem', 'Nazareth', 'Bethlehem'], correct: 2, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'Who led Israel out of Egypt?', options: ['Joshua', 'Moses', 'Aaron'], correct: 1, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    { rarity:'common', icon: '🟢', badge: 'Trivia · Easy', title: 'Easy Trivia', difficulty: 'easy', question: 'How many days did God create in?', options: ['6', '7', '40'], correct: 0, fx: 60, penalty: -30, vp: 1, vpSkip: -1 },
    // ─── TRIVIA — Medium (rare) ───
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'In the Parable of the Talents, what happened to the lazy servant?', options: ['Praised', 'Cast out', 'Gained more'], correct: 1, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'Zacchaeus promised to give the poor what?', options: ['A tenth', 'Half', 'All'], correct: 1, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'How long was Jonah in the great fish?', options: ['1 day', '3 days', '7 days'], correct: 1, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'In the Parable of the Sower, which soil produced fruit?', options: ['Rocky', 'Thorny', 'Good'], correct: 2, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'The widow with 2 coins gave more because?', options: ['Pretty gift', 'All she had', 'Public'], correct: 1, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    { rarity:'rare', icon: '🔵', badge: 'Trivia · Medium', title: 'Medium Trivia', difficulty: 'medium', question: 'Which book has the Beatitudes?', options: ['Matthew', 'Romans', 'Genesis'], correct: 0, fx: 150, penalty: -100, vp: 2, vpSkip: -1 },
    // ─── TRIVIA — Hard (epic) ───
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: 'Whom did Jacob meet at the well in Haran?', options: ['Leah', 'Rachel', 'Rebekah'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: 'Unmerciful Servant owed his master?', options: ['100 denarii', '10,000 talents', '1 mina'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: 'Which prophet anointed both Saul AND David?', options: ['Nathan', 'Samuel', 'Elijah'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: "In Joseph's dream, what bowed first?", options: ['Sun & moon', 'Sheaves', 'Stars'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: 'How many silver pieces did Judas receive?', options: ['12', '30', '50'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: 'King of Salem who blessed Abraham?', options: ['Melchizedek', 'Pharaoh', 'Abimelech'], correct: 0, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
    { rarity:'epic', icon: '🔴', badge: 'Trivia · Hard', title: 'Hard Trivia', difficulty: 'hard', question: "Hannah's son who became a prophet?", options: ['Elisha', 'Samuel', 'Daniel'], correct: 1, fx: 300, penalty: -250, vp: 3, vpSkip: -1, hardBonus: true },
  ],

  // ═══ TEMPTATION FLIP ═══
  'special': [
    // ─── COMMON ───
    { rarity:'common', icon: '🐍', badge: 'Temptation', title: 'Love of Money', body: 'Hoard 120T from a shady deal. Or refuse — let go of greed.', verse: '1 Tim 6:10', acceptFx: 120, declineVp: 2, acceptText: 'Take gold (+120T)', declineText: 'Refuse (+2 Virtue)' },
    { rarity:'common', icon: '🍷', badge: 'Temptation', title: 'Excess & Riot', body: 'Indulge for 80T (lose 1 Wisdom). Or self-control.', verse: 'Prov 23:21', acceptFx: 80, acceptLoseWisdom: 1, declineVp: 2, acceptText: 'Indulge (+80T, -1W)', declineText: 'Self-control (+2 Virtue)' },
    { rarity:'common', icon: '🧂', badge: 'Temptation', title: "Lot's Wife", body: 'Look back — seize 100T from old comfort. Or face forward.', verse: 'Genesis 19:26', acceptFx: 100, declineVp: 2, acceptText: 'Look back (+100T)', declineText: 'Face forward (+2 Virtue)' },
    // ─── RARE ───
    { rarity:'rare', icon: '👑', badge: 'Temptation', title: 'Pride of Babylon', body: 'Babylon offers honor & riches: +150T but skip next turn. Or stay humble.', verse: 'Prov 16:18', acceptFx: 150, acceptSkipTurn: true, declineVp: 3, acceptText: 'Take throne (+150T, skip turn)', declineText: 'Walk humbly (+3 Virtue)' },
    { rarity:'rare', icon: '⚔️', badge: 'Temptation', title: 'Wandering 40 Years', body: 'Take the shortcut: +150T but skip next turn. Or obey first time.', verse: 'Num 14:33', acceptFx: 150, acceptSkipTurn: true, declineVp: 2, acceptText: 'Shortcut (+150T, skip)', declineText: 'Obey (+2 Virtue)' },
    { rarity:'rare', icon: '🐂', badge: 'Temptation', title: 'Golden Calf', body: 'The crowd worships gold. Bow with them for +200T, or stand alone.', verse: 'Exodus 32:4', acceptFx: 200, declineVp: 4, acceptText: 'Bow (+200T)', declineText: 'No idols (+4 Virtue)' },
    // ─── EPIC ───
    { rarity:'epic', icon: '🕷️', badge: 'Temptation', title: "Spider's Web", body: 'Accept 180T, but the richest player chooses what you lose (1 Wisdom OR 2 Virtue). Or refuse cleanly.', verse: 'Prov 14:12', acceptFx: 180, acceptWebPenalty: true, declineVp: 3, acceptText: 'Take it (+180T, lose something)', declineText: 'Walk free (+3 Virtue)' },
    { rarity:'epic', icon: '🏛️', badge: 'Temptation', title: 'Tower of Babel', body: 'Build a name for yourself: +250T, but ALL other players also gain 50T (you boost rivals). Or refuse.', verse: 'Genesis 11:4', acceptFx: 250, acceptBabel: true, declineVp: 4, acceptText: 'Build tower (+250T, rivals gain too)', declineText: 'Stay humble (+4 Virtue)' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PLACE-THEMED CARDS (lighter set for pacing)
// ═══════════════════════════════════════════════════════════════
const PLACE_CARDS = {
  'Capernaum': [
    { icon: '🐟', badge: 'Capernaum', title: 'Fishing Boats', body: 'Great catch! Gain 90T.', verse: 'Luke 5:6', fx: 90 },
    { icon: '✨', badge: 'Capernaum', title: "Centurion's Faith", body: 'Faith from afar! Gain 100T.', verse: 'Matt 8:5', fx: 100 },
  ],
  'Bethsaida': [{ icon: '🍞', badge: 'Bethsaida', title: 'Five Loaves & Two Fish', body: '5,000 fed! Gain 80T.', verse: 'John 6:9', fx: 80 }],
  'Antioch': [
    { icon: '✉️', badge: 'Antioch', title: 'First Christians', body: 'Each player gains 40T.', verse: 'Acts 11:26', fx: 40, allPlayers: true, vp: 1 },
    { icon: '🍞', badge: 'Antioch', title: 'Famine Relief', body: 'Pay 60T to poorest player.', verse: 'Acts 11:29', fx: -60, communal: true, vp: 2 },
  ],
  'Babylon Gate': [
    { icon: '🦁', badge: 'Babylon', title: "Daniel in Lions' Den", body: 'Faith preserved! Gain 120T.', verse: 'Daniel 6:22', fx: 120 },
    { icon: '🔥', badge: 'Babylon', title: 'Fiery Furnace', body: 'Refuse the idol. +2 Virtue.', verse: 'Daniel 3:25', fx: 0, vp: 2 },
  ],
  'Babylon Ct': [
    { icon: '✍️', badge: 'Babylon', title: 'Writing on Wall', body: 'Belshazzar judged! Lose 100T.', verse: 'Daniel 5:25', fx: -100 },
  ],
  'Jordan Ford': [
    { icon: '🕊️', badge: 'Jordan', title: 'Jesus Baptized', body: 'Heavens opened! Gain 110T.', verse: 'Matt 3:16', fx: 110 },
    { icon: '🌊', badge: 'Jordan', title: 'Crossing on Dry Ground', body: 'Advance 4 spaces.', verse: 'Joshua 3:17', fx: 50, advance: 4 },
  ],
  'Decapolis': [{ icon: '🧠', badge: 'Decapolis', title: 'Demoniac Restored', body: 'Each player gives 25T.', verse: 'Mark 5:20', fx: 0, fromAll: 25 }],
  'Peraea': [{ icon: '👶', badge: 'Peraea', title: 'Bless the Children', body: 'Gain 60T.', verse: 'Mark 10:14', fx: 60 }],
  'Machaerus': [{ icon: '⛓️', badge: 'Machaerus', title: 'John Imprisoned', body: 'Pay 70T tithe in his memory.', verse: 'Mark 6:17', fx: -70, vp: 1 }],
  'Dead Sea N': [{ icon: '🏜️', badge: 'Dead Sea', title: "Ezekiel's Healing River", body: 'Restoration! Gain 90T.', verse: 'Ezek 47:8', fx: 90 }],
  'Dead Sea S': [{ icon: '📜', badge: 'Dead Sea', title: 'Dead Sea Scrolls', body: 'Wisdom preserved! Gain 100T.', verse: '1947', fx: 100 }],
  'Negev': [{ icon: '🐪', badge: 'Negev', title: "Abraham's Journey", body: 'Advance 3 and gain 50T.', verse: 'Gen 13:1', fx: 50, advance: 3 }],
  'Nile Trade': [
    { icon: '👑', badge: 'Nile', title: "Joseph's Rise", body: 'From prison to court! Gain 130T.', verse: 'Gen 41:41', fx: 130 },
    { icon: '🐸', badge: 'Nile', title: 'Plagues of Egypt', body: '"Let my people go!" Pay 90T.', verse: 'Exod 7-12', fx: -90 },
  ],
  'Sinai': [
    { icon: '📜', badge: 'Sinai', title: 'Ten Commandments', body: 'Gain 150T.', verse: 'Exodus 20', fx: 150 },
    { icon: '🐂', badge: 'Sinai', title: 'Golden Calf', body: 'Idolatry! Lose 100T.', verse: 'Exod 32:4', fx: -100 },
  ],
  'Hebron': [{ icon: '👑', badge: 'Hebron', title: 'David Anointed King', body: 'Gain 110T.', verse: '2 Sam 5:3', fx: 110 }],
  'Judea Hills': [{ icon: '⛪', badge: 'Judea', title: 'Visit to Elizabeth', body: 'Each player gains 30T.', verse: 'Luke 1:39', fx: 30, allPlayers: true, vp: 1 }],
  'Nazareth': [
    { icon: '🌟', badge: 'Nazareth', title: 'Annunciation', body: 'Gain 120T.', verse: 'Luke 1:28', fx: 120 },
    { icon: '🔨', badge: 'Nazareth', title: "Carpenter's Workshop", body: '60T per ministry.', verse: 'Mark 6:3', fx: 0, perMinistry: 60 },
  ],
  'Jerusalem': [
    { icon: '👑', badge: 'Jerusalem', title: "David's Capital", body: 'Gain 150T.', verse: '2 Sam 5:7', fx: 150 },
    { icon: '✝️', badge: 'Jerusalem', title: 'Resurrection Morning', body: 'Gain 200T.', verse: 'Matt 28:6', fx: 200 },
  ],
  'Zion Gate': [{ icon: '🕊️', badge: 'Zion', title: 'Pentecost Outpouring', body: 'All players gain 50T.', verse: 'Acts 2:41', fx: 50, allPlayers: true, vp: 1 }],
  'Samaria': [{ icon: '💧', badge: 'Samaria', title: 'Woman at Well', body: 'Gain 100T.', verse: 'John 4:14', fx: 100 }],
  'Sychar': [{ icon: '🪣', badge: 'Sychar', title: "Jacob's Well", body: 'Gain 80T.', verse: 'John 4:6', fx: 80 }],
  'Mt Gerizim': [{ icon: '⛰️', badge: 'Mt Gerizim', title: 'True Worship', body: 'Gain 90T.', verse: 'John 4:23', fx: 90 }],
  'Tiberias': [{ icon: '🍞', badge: 'Tiberias', title: 'Breakfast on Shore', body: 'Gain 90T.', verse: 'John 21:12', fx: 90 }],
};

// ═══════════════════════════════════════════════════════════════
// APOSTLE NPCs
// ═══════════════════════════════════════════════════════════════
const APOSTLES = [
  // Common apostles (most appearances)
  { id:'paul', emj:'✉️', name:'Paul of Tarsus', intro:'Paul appears with a mission!', body:'"Support the church-planting mission. Give 100T?"', verse:'2 Cor 9:7', task:'donate100', acceptFx:-100, acceptVp:3, acceptWisdom:2, declineVp:-1, quote:'God multiplies the seed that the generous sow. (2 Cor 9:10)' },
  { id:'peter', emj:'🗝️', name:'Simon Peter', intro:'Peter calls you to step out in faith!', body:'"Cast your nets! Risk 80T — flip a coin: win 200T or lose your stake."', verse:'John 21:6', task:'gamble', acceptFx:-80, gamble:true, gambleWin:200, acceptVp:1, quote:'When faith calls, step out of the boat. (Matt 14:28-29)' },
  { id:'john', emj:'❤️', name:'John the Beloved', intro:'John meets you on the road!', body:'"Love your neighbor — give 60T to the poorest."', verse:'1 John 4:7', task:'giveToPoorest', acceptFx:-60, acceptVp:3, acceptWisdom:1, declineVp:-1, quote:'Love one another, for love is from God. (1 John 4:7)' },
  { id:'james', emj:'⚖️', name:'James the Just', intro:'James the Just challenges you.', body:'"Faith without works is dead! Build a ministry now (if able) for +50T blessing."', verse:'James 2:17', task:'buildMinistry', acceptVp:2, acceptWisdom:1, acceptBonusFx:50, quote:'True faith cares for the orphan and the widow. (James 1:27)' },
  { id:'mary', emj:'🌹', name:'Mary of Bethany', intro:'Mary anoints you with costly perfume!', body:'"Tithe 10% of your Talents — pour out all you have in worship."', verse:'John 12:3', task:'tithe10pct', acceptVp:3, acceptWisdom:2, quote:'A heart of worship gives its costliest treasure. (Mark 14:6)' },
  { id:'andrew', emj:'🐟', name:'Andrew', intro:'Andrew brings a friend to meet you!', body:'"Share 25T with each fellow pilgrim — generosity multiplied!"', verse:'John 1:42', task:'shareToAll', shareToAll:25, acceptVp:2, acceptWisdom:1, quote:'The first thing Andrew did was bring a friend to Jesus. (John 1:41-42)' },
  { id:'barnabas', emj:'💛', name:'Barnabas', intro:'Barnabas the Encourager comes alongside.', body:'"Sell some land — give 50T, gain 100T net for the cause."', verse:'Acts 4:36', task:'sellForKingdom', acceptFx:-50, acceptBonusFx:100, acceptVp:2, acceptWisdom:1, quote:"Barnabas sold what he owned and laid it at the apostles' feet. (Acts 4:37)" },
  { id:'thomas', emj:'🔍', name:'Thomas', intro:'Thomas appears with a question of faith.', body:'"Trust without seeing? Risk 50T — flip a coin: 150T or lose."', verse:'John 20:29', task:'gambleSmall', acceptFx:-50, gamble:true, gambleWin:150, acceptVp:1, declineVp:-1, quote:'Blessing belongs to those who believe without seeing. (John 20:29)' },
  // Legendary apostles (very rare appearances — major rewards)
  { id:'mary-mag', emj:'👑', name:'Mary Magdalene', legendary:true, intro:'Mary Magdalene appears in joyful witness!', body:'"He is risen indeed! Share the good news. Give 80T and receive a great blessing."', verse:'John 20:18', task:'donate100', acceptFx:-80, acceptBonusFx:300, acceptVp:5, acceptWisdom:2, declineVp:-1, quote:'I have seen the Lord. (John 20:18)' },
  { id:'stephen', emj:'⭐', name:'Stephen the Martyr', legendary:true, intro:'Stephen, filled with grace, appears!', body:'"Speak boldly — sacrifice 100T for the kingdom. Great virtue awaits."', verse:'Acts 7:55', task:'sellForKingdom', acceptFx:-100, acceptBonusFx:250, acceptVp:6, acceptWisdom:2, declineVp:-2, quote:'Lord, do not hold this sin against them. (Acts 7:60)' },
  { id:'risen-christ', emj:'✝️', name:'The Risen Christ', legendary:true, intro:'A divine encounter — the Risen Lord meets you!', body:'"Walk with Me. Receive grace upon grace."', verse:'Luke 24:32', task:'donate100', acceptFx:0, acceptBonusFx:400, acceptVp:8, acceptWisdom:3, declineVp:-3, quote:'Did not our hearts burn within us? (Luke 24:32)' },
];

// Apostle picker: legendaries appear 8% of the time (when an apostle is triggered)
function pickApostle() {
  const legendaries = APOSTLES.filter(a => a.legendary);
  const commons = APOSTLES.filter(a => !a.legendary);
  if (Math.random() < 0.08 && legendaries.length) {
    return legendaries[Math.floor(Math.random() * legendaries.length)];
  }
  return commons[Math.floor(Math.random() * commons.length)];
}

const INTERACTIONS = [
  { id:'encourage', emj:'💛', name:'Encourage', desc:'Pay 30T to give them a 50T blessing.', cost:30, requiresAccept:false, vpInitiator:1 },
  { id:'pray',      emj:'🙏', name:'Pray Together', desc:'Both gain 1 Wisdom Card. Free!', cost:0, requiresAccept:true, vpInitiator:1, vpTarget:1 },
  { id:'trade',     emj:'🤝', name:'Tithe-Trade', desc:'Pay 80T to swap board positions.', cost:80, requiresAccept:true },
  { id:'duel',      emj:'⚔️', name:'Wisdom Duel', desc:'Coin-flip for 100T from loser.', cost:0, requiresAccept:true },
  { id:'tax-collector', emj:'🧾', name:'Tax Collector', desc:'Demand 60T (target must have 2x your wealth).', cost:0, requiresAccept:true, requiresWealthier:true, vpInitiator:-1 },
];

const HEROES = [
  { n:'Dove', emj:'🕊', color:'#5b9bdc' },
  { n:'Lion', emj:'🦁', color:'#e0a035' },
  { n:'Vine', emj:'🌿', color:'#4aad70' },
  { n:'Sword', emj:'⚔️', color:'#c5503d' },
  { n:'Rose', emj:'🌸', color:'#d76b9c' },
  { n:'Scholar', emj:'📖', color:'#9871d6' },
];

// ═══════════════════════════════════════════════════════════════
// SCORING — NEW Kingdom Impact Score (5 dimensions)
// ═══════════════════════════════════════════════════════════════
function calcScore(p) {
  const tierBonus = p.tier === 3 ? 50 : p.tier === 2 ? 25 : 10;
  return Math.floor(p.talents / 100)
       + p.ministries * 8
       + p.wisdomCards * 4
       + p.titheTokens * 3
       + (p.virtuePoints || 0) * 5
       + tierBonus
       + (p.generosityBonus || 0);
}

function getTier(xp) {
  if (xp >= 200) return 3;
  if (xp >= 100) return 2;
  return 1;
}

function awardXp(p, amount) {
  p.xp += amount;
  const oldTier = p.tier;
  p.tier = getTier(p.xp);
  return p.tier > oldTier;
}

// ═══════════════════════════════════════════════════════════════
// ROOM MANAGEMENT
// ═══════════════════════════════════════════════════════════════
const rooms = new Map();
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function modeConfig(mode) {
  return mode === 'full' ? {
    roundCap: 20, startTalents: 1500, salary: 200,
    stewardXp: 250, minMinistries: 5, apostleRate: 0.22,
  } : {
    roundCap: 12, startTalents: 1200, salary: 250,
    stewardXp: 200, minMinistries: 4, apostleRate: 0.25,
  };
}

function newPlayer(socketId, name, hero, startTalents) {
  return {
    id: socketId, name, icon: hero.emj, color: hero.color, heroN: hero.n,
    pos: 0, talents: startTalents, ministries: 0, owned: [],
    wisdomCards: 0, titheTokens: 0, virtuePoints: 0, xp: 0, tier: 1,
    skipTurn: false, connected: true, missedTithes: 0, generosityBonus: 0,
    // New buffs/effects
    doubleNextRoll: false, shield: 0, mustardSeed: 0,
  };
}

function createRoom(hostSocketId, hostName, hostHero, mode = 'quick') {
  const code = generateCode();
  const config = modeConfig(mode);
  const state = {
    code, phase: 'lobby', mode, config,
    hostId: hostSocketId,
    players: [newPlayer(hostSocketId, hostName, hostHero, config.startTalents)],
    currentPlayerIndex: 0, round: 1, tithePool: 200, rolled: false,
    log: [`✦ Room created (${mode==='full'?'Full · 20 rounds':'Quick · 12 rounds'}). Share the code!`],
    pendingCard: null, cardOffer: null, apostleEncounter: null,
    coLocation: null, pendingInteraction: null,
    finalLap: null, gameOver: null,
    createdAt: Date.now(),
  };
  rooms.set(code, state);
  return state;
}

function getPublicState(state) {
  return {
    code: state.code, phase: state.phase, mode: state.mode, config: state.config,
    hostId: state.hostId, players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    round: state.round, tithePool: state.tithePool, rolled: state.rolled,
    log: state.log.slice(-25),
    pendingCard: state.pendingCard, cardOffer: state.cardOffer,
    apostleEncounter: state.apostleEncounter, coLocation: state.coLocation,
    pendingInteraction: state.pendingInteraction,
    finalLap: state.finalLap, gameOver: state.gameOver,
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

// Rarity-weighted card picker.
// Probabilities: common 60% / rare 25% / epic 12% / legendary 3%.
// Falls back to lower tier if a rarity has no cards in this deck.
const RARITY_WEIGHTS = [
  { tier: 'legendary', p: 0.03 },
  { tier: 'epic',      p: 0.12 },
  { tier: 'rare',      p: 0.25 },
  { tier: 'common',    p: 0.60 },
];
function rollRarity() {
  const r = Math.random();
  // Cumulative: legendary 0-0.03, epic 0.03-0.15, rare 0.15-0.40, common 0.40-1.0
  if (r < 0.03) return 'legendary';
  if (r < 0.15) return 'epic';
  if (r < 0.40) return 'rare';
  return 'common';
}
function pickCard(type) {
  const deck = CARDS[type] || CARDS['special'];
  let tier = rollRarity();
  // Try requested tier first, then fall back through cheaper tiers if empty.
  const fallbackOrder = {
    legendary: ['legendary','epic','rare','common'],
    epic:      ['epic','rare','common'],
    rare:      ['rare','common'],
    common:    ['common','rare','epic'],
  };
  for (const t of fallbackOrder[tier]) {
    const pool = deck.filter(c => c.rarity === t);
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)];
  }
  // ultimate fallback — any card
  return deck[Math.floor(Math.random() * deck.length)];
}

function cardTypeLabel(t) {
  return t==='card-w'?'Wisdom':t==='card-a'?'Acts':t==='card-p'?'Parable':t==='special'?'Temptation':'card';
}

// ═══════════════════════════════════════════════════════════════
// processRoll — moves player, triggers space, handles co-location
// ═══════════════════════════════════════════════════════════════
function processRoll(state, d1, d2) {
  let total = d1 + d2;
  const p = state.players[state.currentPlayerIndex];
  // NEW: consume doubleNextRoll buff if active
  if (p.doubleNextRoll) {
    total *= 2;
    p.doubleNextRoll = false;
    addLog(state, `✨ ${p.name}'s blessing — dice doubled to ${total}!`);
  }
  const oldPos = p.pos;
  const newPos = (p.pos + total) % 40;
  p.pos = newPos;
  state.rolled = true;
  state.apostleEncounter = null;
  state.coLocation = null;

  addLog(state, `${p.name} rolled ${d1}+${d2}=${total} → ${SPACES[newPos].n}`);

  // Pass Begin
  if (newPos <= oldPos && oldPos !== 0) {
    p.talents += state.config.salary;
    const tithe = Math.floor(state.config.salary * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    if (p.titheTokens % 2 === 0) p.virtuePoints += 1;
    addLog(state, `${p.name} passed Begin — +${state.config.salary}T (tithed ${tithe}T)`);
  }

  // Co-location
  const others = state.players.filter(pl => pl.id !== p.id && pl.connected && pl.pos === newPos);
  if (others.length > 0) {
    const other = others[0];
    state.coLocation = {
      playerAId: p.id, playerAName: p.name, playerAIcon: p.icon,
      playerBId: other.id, playerBName: other.name, playerBIcon: other.icon,
      placeName: SPACES[newPos].n,
    };
    addLog(state, `⚔ ${p.name} encounters ${other.name} at ${SPACES[newPos].n}!`);
  }

  const sp = SPACES[newPos];
  if (sp.t === 'tax') {
    const tithe = Math.floor(p.talents * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    p.virtuePoints += 1;
    addLog(state, `${p.name} tithed ${tithe}T at the Temple ⚖ (+1 Virtue)`);
  } else if (sp.t === 'corner') {
    handleCorner(state, p, newPos);
  } else if (CARDS[sp.t] || sp.t === 'special') {
    if (Math.random() < state.config.apostleRate) {
      const apostle = pickApostle();
      state.apostleEncounter = { ...apostle, playerId: p.id, playerName: p.name, playerIcon: p.icon, placeName: sp.n };
      addLog(state, `✨ ${apostle.emj} ${apostle.name} appears!`);
    } else {
      const cardType = sp.t === 'special' ? 'special' : sp.t;
      state.cardOffer = { cardType, playerId: p.id, placeName: sp.n };
    }
  } else if (sp.t === 'property' && PLACE_CARDS[sp.n]) {
    if (Math.random() < state.config.apostleRate * 0.6) {
      const apostle = pickApostle();
      state.apostleEncounter = { ...apostle, playerId: p.id, playerName: p.name, playerIcon: p.icon, placeName: sp.n };
      addLog(state, `✨ ${apostle.emj} ${apostle.name} appears!`);
    } else {
      state.cardOffer = { cardType: 'place', playerId: p.id, placeName: sp.n };
    }
  }

  awardXp(p, 5);
  return { roll: [d1, d2] };
}

function handleCorner(state, p, pos) {
  if (pos === 10) addLog(state, `${p.name} enters the Wilderness — silent reflection`);
  else if (pos === 20) {
    p.talents += 100;
    const tithe = 10;
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    p.virtuePoints += 1;
    addLog(state, `${p.name} reached Temple — 100T offering, +1 Virtue`);
  } else if (pos === 30) {
    p.talents += 50;
    addLog(state, `${p.name} reached Mt Carmel — 50T blessing`);
  }
}

function drawOfferedCard(state) {
  if (!state.cardOffer) return null;
  const offer = state.cardOffer;
  let card;
  if (offer.cardType === 'place' && PLACE_CARDS[offer.placeName]) {
    const pool = PLACE_CARDS[offer.placeName];
    card = pool[Math.floor(Math.random() * pool.length)];
  } else {
    card = pickCard(offer.cardType);
  }
  const drawerP = state.players.find(pl => pl.id === offer.playerId);
  state.pendingCard = {
    ...card,
    drawerId: offer.playerId,
    drawerName: drawerP ? drawerP.name : '',
    drawerIcon: drawerP ? drawerP.icon : '',
  };
  state.cardOffer = null;
  if (drawerP) addLog(state, `${drawerP.name} drew: ${card.title}`);
  return card;
}

// ═══════════════════════════════════════════════════════════════
// applyCard — handles all card types including the temptation flip
// ═══════════════════════════════════════════════════════════════
function applyCard(state, accepted, triviaAnswerIdx) {
  const card = state.pendingCard;
  if (!card) return null;
  const p = state.players[state.currentPlayerIndex];

  // TRIVIA
  if (card.options && typeof card.correct === 'number') {
    if (!accepted) {
      if (card.vpSkip) p.virtuePoints += card.vpSkip;
      addLog(state, `${p.name} skipped trivia (${card.vpSkip}V)`);
      state.pendingCard = null;
      return { type:'trivia-skipped', playerName:p.name, playerIcon:p.icon, card, vpDelta: card.vpSkip||0 };
    }
    if (typeof triviaAnswerIdx !== 'number') {
      state.pendingCard = null;
      return { type:'trivia-noanswer', playerName:p.name, playerIcon:p.icon, card };
    }
    const isCorrect = triviaAnswerIdx === card.correct;
    if (isCorrect) {
      p.talents += card.fx;
      if (card.vp) p.virtuePoints += card.vp;
      if (card.hardBonus) p.wisdomCards++;
      awardXp(p, card.difficulty==='hard'?30:card.difficulty==='medium'?20:10);
      addLog(state, `✓ ${p.name} correct! +${card.fx}T${card.vp?` +${card.vp}V`:''}`);
    } else {
      p.talents = Math.max(0, p.talents + card.penalty);
      addLog(state, `✗ ${p.name} wrong (${card.options[card.correct]}). ${card.penalty}T`);
    }
    state.pendingCard = null;
    return { type:'trivia', playerName:p.name, playerIcon:p.icon, card, answerIdx:triviaAnswerIdx, correct:isCorrect, delta:isCorrect?card.fx:card.penalty, vpDelta:isCorrect?(card.vp||0):0 };
  }

  // TEMPTATION FLIP
  if (card.acceptFx !== undefined && card.declineVp !== undefined) {
    if (accepted) {
      // Shield check — if player has a shield, it negates the temptation penalty
      if (p.shield && p.shield > 0 && (card.acceptSkipTurn || card.acceptLoseWisdom || card.acceptWebPenalty)) {
        p.shield--;
        p.talents += card.acceptFx; // gain talents but no penalty
        addLog(state, `🛡️ ${p.name} shielded from "${card.title}" — gained ${card.acceptFx}T cleanly`);
      } else {
        p.talents += card.acceptFx;
        if (card.acceptSkipTurn) p.skipTurn = true;
        if (card.acceptLoseWisdom) p.wisdomCards = Math.max(0, p.wisdomCards - card.acceptLoseWisdom);
        // NEW: Spider's Web — lose 1 Wisdom (simplified: auto-applied)
        if (card.acceptWebPenalty) {
          if (p.wisdomCards > 0) {
            p.wisdomCards--;
            addLog(state, `🕷️ ${p.name} caught in web — lost 1 Wisdom`);
          } else if (p.virtuePoints >= 2) {
            p.virtuePoints -= 2;
            addLog(state, `🕷️ ${p.name} caught in web — lost 2 Virtue`);
          }
        }
        // NEW: Tower of Babel — gain T but ALL other players also gain 50T
        if (card.acceptBabel) {
          state.players.filter(pl => pl.id !== p.id && pl.connected).forEach(pl => pl.talents += 50);
          addLog(state, `🏛️ Tower of Babel — rivals also gained 50T each`);
        }
        addLog(state, `${p.name} took the gold (+${card.acceptFx}T from "${card.title}")`);
      }
    } else {
      p.virtuePoints += card.declineVp;
      awardXp(p, 15);
      addLog(state, `${p.name} resisted "${card.title}" (+${card.declineVp}V) ✦`);
    }
    state.pendingCard = null;
    return { type:accepted?'temptation-accept':'temptation-decline', playerName:p.name, playerIcon:p.icon, card, vpDelta:accepted?0:card.declineVp, delta:accepted?card.acceptFx:0 };
  }

  // REGULAR CARDS
  let totalGained = 0, vpGained = 0;
  if (accepted) {
    let gained = card.fx || 0;
    if (card.perMinistry) {
      gained += card.perMinistry * p.ministries;
      addLog(state, `Year of Abundance — ${p.ministries}× ${card.perMinistry}T`);
    }
    if (card.doubleUpTo) {
      const dub = Math.min(p.talents, card.doubleUpTo);
      gained += dub;
    }
    if (card.fromAll) {
      const others = state.players.filter(pl => pl.id !== p.id && pl.connected);
      others.forEach(pl => {
        const give = Math.min(card.fromAll, pl.talents);
        pl.talents -= give;
        gained += give;
      });
    }
    if (gained > 0) {
      p.talents += gained;
      p.wisdomCards++;
      addLog(state, `${p.name} +${gained}T ✦`);
    } else if (gained < 0) {
      p.talents = Math.max(0, p.talents + gained);
      addLog(state, `${p.name} paid ${Math.abs(gained)}T`);
    }
    totalGained = gained;
    if (card.toTithePool && gained < 0) state.tithePool += Math.abs(gained);
    if (card.freeMinistry && !p.owned.includes(p.pos) && SPACES[p.pos].t === 'property') {
      p.ministries++;
      p.owned.push(p.pos);
      addLog(state, `${p.name} built free Ministry!`);
    }
    if (card.allPlayers && card.fx > 0) {
      state.players.filter(pl => pl.id !== p.id && pl.connected).forEach(pl => pl.talents += card.fx);
      addLog(state, `All pilgrims received ${card.fx}T`);
    }
    if (card.communal && card.fx < 0) {
      const poorest = state.players.filter(pl => pl.id !== p.id && pl.connected).sort((a,b)=>a.talents-b.talents)[0];
      if (poorest) {
        poorest.talents += Math.abs(card.fx);
        addLog(state, `${poorest.name} received ${Math.abs(card.fx)}T from ${p.name}`);
      }
    }
    if (card.vp) {
      p.virtuePoints += card.vp;
      vpGained = card.vp;
      addLog(state, `${p.name} +${card.vp}V ✦`);
    }
    if (card.wisdom) {
      p.wisdomCards += card.wisdom;
      addLog(state, `${p.name} +${card.wisdom} Wisdom`);
    }
    if (card.advance && typeof card.advance === 'number') {
      p.pos = (p.pos + card.advance) % 40;
      addLog(state, `${p.name} advanced ${card.advance} to ${SPACES[p.pos].n}`);
    }
    if (card.advanceToCorner !== undefined) {
      p.pos = card.advanceToCorner;
      addLog(state, `${p.name} advanced to ${SPACES[p.pos].n}`);
    }
    // NEW: sprint forward N spaces, ignoring intermediate effects
    if (card.sprint) {
      p.pos = (p.pos + card.sprint) % 40;
      addLog(state, `${p.name} sprinted ${card.sprint} spaces → ${SPACES[p.pos].n}`);
    }
    // NEW: advance to next corner from current position
    if (card.advanceToNextCorner) {
      const corners = [0, 10, 20, 30];
      const next = corners.find(c => c > p.pos) ?? 0;
      p.pos = next;
      addLog(state, `${p.name} advanced to ${SPACES[next].n}`);
    }
    // NEW: double the next dice roll (consumed on next processRoll)
    if (card.doubleNextRoll) {
      p.doubleNextRoll = true;
      addLog(state, `${p.name} blessed — next dice roll DOUBLES!`);
    }
    // NEW: shield against next N temptations/penalties
    if (card.shield) {
      p.shield = (p.shield || 0) + card.shield;
      addLog(state, `${p.name} gains ${card.shield} shield(s)`);
    }
    // NEW: plant a mustard seed — passive +N talents per ministry every round
    if (card.plantMustardSeed) {
      p.mustardSeed = (p.mustardSeed || 0) + card.plantMustardSeed;
      addLog(state, `${p.name} planted Mustard Seed — +${card.plantMustardSeed}T/ministry/round`);
    }
    // NEW: Year of Jubilee — boost all players under 200T to 500T
    if (card.jubilee) {
      let blessed = 0;
      state.players.forEach(pl => {
        if (pl.connected && pl.talents < 200) {
          pl.talents = 500;
          blessed++;
        }
      });
      addLog(state, `🎉 Year of Jubilee! ${blessed} pilgrim(s) blessed with 500T`);
    }
    // NEW: draw N cards and keep them all (legendary Pentecost effect)
    if (card.drawAndKeep) {
      p.wisdomCards += card.drawAndKeep;
      addLog(state, `${p.name} received ${card.drawAndKeep} Wisdom cards!`);
    }
    // NEW: manna from tithe pool — each player gets N from the pool
    if (card.mannaFromTithe) {
      const each = card.mannaFromTithe;
      const total = each * state.players.filter(pl => pl.connected).length;
      const available = Math.min(total, state.tithePool);
      const perPerson = Math.floor(available / state.players.filter(pl => pl.connected).length);
      state.players.filter(pl => pl.connected).forEach(pl => pl.talents += perPerson);
      state.tithePool -= perPerson * state.players.filter(pl => pl.connected).length;
      addLog(state, `🍞 Manna from heaven! Each pilgrim received ${perPerson}T`);
    }
    // NEW: Lazarus — if poor, get a big boost
    if (card.lazarus && p.talents < 100) {
      p.talents += 250;
      addLog(state, `⚰️ Lazarus rises! ${p.name} +250T`);
    }
    // NEW: heal — remove skipTurn
    if (card.healAll) {
      if (p.skipTurn) {
        p.skipTurn = false;
        addLog(state, `${p.name} healed at Bethesda — skip-turn removed`);
      }
    }
    // NEW: Esther — steal from the richest player
    if (card.stealFromRichest) {
      const richest = state.players
        .filter(pl => pl.id !== p.id && pl.connected)
        .sort((a, b) => b.talents - a.talents)[0];
      if (richest && richest.talents >= card.stealFromRichest) {
        richest.talents -= card.stealFromRichest;
        p.talents += card.stealFromRichest;
        addLog(state, `👑 ${p.name} took ${card.stealFromRichest}T from ${richest.name} (Esther's courage)`);
      }
    }
    if (card.skipTurn) {
      p.skipTurn = true;
      addLog(state, `${p.name} will skip next turn`);
    }
    awardXp(p, 10);
  } else {
    addLog(state, `${p.name} skipped the card`);
  }
  state.pendingCard = null;
  return { type:accepted?'card':'card-skipped', playerName:p.name, playerIcon:p.icon, card, delta:totalGained, vpDelta:vpGained };
}

function buyMinistry(state) {
  const p = state.players[state.currentPlayerIndex];
  const sp = SPACES[p.pos];
  if (sp.t !== 'property') return { err: 'Can only buy property spaces!' };
  if (p.owned.includes(p.pos)) return { err: 'You already own this!' };
  if (p.talents < 200) return { err: 'Need 200 Talents.' };
  p.talents -= 200;
  p.ministries++;
  p.owned.push(p.pos);
  p.virtuePoints += 1;
  awardXp(p, 25);
  addLog(state, `${p.name} built Ministry at ${sp.n}! 🏛 (+1V)`);
  return { ok: true, placeName: sp.n };
}

function applyInteraction(state, initiator, target, interaction, accepted) {
  if (!accepted) {
    addLog(state, `${target.name} declined ${initiator.name}'s "${interaction.name}"`);
    return;
  }
  switch (interaction.id) {
    case 'encourage':
      initiator.talents = Math.max(0, initiator.talents - interaction.cost);
      target.talents += 50;
      if (interaction.vpInitiator) initiator.virtuePoints += interaction.vpInitiator;
      addLog(state, `${initiator.name} encouraged ${target.name} (+50T)`);
      break;
    case 'pray':
      initiator.wisdomCards++; target.wisdomCards++;
      if (interaction.vpInitiator) initiator.virtuePoints += interaction.vpInitiator;
      if (interaction.vpTarget) target.virtuePoints += interaction.vpTarget;
      addLog(state, `${initiator.name} & ${target.name} prayed (+1V each)`);
      break;
    case 'trade': {
      initiator.talents = Math.max(0, initiator.talents - interaction.cost);
      const tmp = initiator.pos;
      initiator.pos = target.pos;
      target.pos = tmp;
      addLog(state, `${initiator.name} & ${target.name} swapped positions`);
      break;
    }
    case 'duel': {
      const initWins = Math.random() < 0.5;
      if (initWins) {
        const amt = Math.min(100, target.talents);
        target.talents -= amt; initiator.talents += amt;
        addLog(state, `⚔ ${initiator.name} won the Wisdom Duel (+${amt}T)`);
      } else {
        const amt = Math.min(100, initiator.talents);
        initiator.talents -= amt; target.talents += amt;
        addLog(state, `⚔ ${target.name} won the Wisdom Duel (+${amt}T)`);
      }
      break;
    }
    case 'tax-collector': {
      const amt = Math.min(60, target.talents);
      target.talents -= amt; initiator.talents += amt;
      if (interaction.vpInitiator) initiator.virtuePoints += interaction.vpInitiator;
      addLog(state, `🧾 ${initiator.name} extorted ${amt}T from ${target.name} (-1V)`);
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// END TURN — manages Final Lap state machine
// ═══════════════════════════════════════════════════════════════
function endTurn(state) {
  const active = state.players.filter(p => p.connected);
  const cur = state.players[state.currentPlayerIndex];
  if (cur.skipTurn) cur.skipTurn = false;
  cur.tier = getTier(cur.xp);

  // Final lap state machine
  if (state.finalLap) {
    state.finalLap.remainingPlayers = state.finalLap.remainingPlayers.filter(id => id !== cur.id);
    if (state.finalLap.remainingPlayers.length === 0) {
      finalizeGame(state);
      return;
    }
  } else {
    if (checkFinalLapTrigger(state) || state.round >= state.config.roundCap) {
      triggerFinalLap(state, cur.id);
    }
  }

  const curActiveIdx = active.indexOf(cur);
  const nextActive = active[(curActiveIdx + 1) % active.length];
  state.currentPlayerIndex = state.players.indexOf(nextActive);
  if (state.currentPlayerIndex === state.players.findIndex(p => p.connected)) {
    state.round++;
    // NEW: Mustard Seed passive — each round, plant-owners gain per-ministry talents
    state.players.forEach(pl => {
      if (pl.connected && pl.mustardSeed && pl.ministries > 0) {
        const yield_ = pl.mustardSeed * pl.ministries;
        pl.talents += yield_;
        addLog(state, `🌱 ${pl.name}'s Mustard Seed yields ${yield_}T (${pl.ministries} ministries)`);
      }
    });
  }
  state.rolled = false;
  state.pendingCard = null;
  state.cardOffer = null;
  state.apostleEncounter = null;
  state.coLocation = null;
  addLog(state, `${nextActive.name}'s turn ✦`);
}

function checkFinalLapTrigger(state) {
  for (const p of state.players) {
    if (p.tier === 3 && p.ministries >= state.config.minMinistries) return true;
  }
  return false;
}

function triggerFinalLap(state, triggerId) {
  const active = state.players.filter(p => p.connected);
  state.finalLap = {
    triggerPlayerId: triggerId,
    remainingPlayers: active.filter(p => p.id !== triggerId).map(p => p.id),
  };
  addLog(state, `⭐ FINAL LAP! Each remaining pilgrim gets 1 more turn.`);
}

function finalizeGame(state) {
  // Generosity bonus
  const sortedByTithe = [...state.players].filter(p => p.connected).sort((a,b) => b.titheTokens - a.titheTokens);
  if (sortedByTithe.length > 0 && sortedByTithe[0].titheTokens > 0) {
    sortedByTithe[0].generosityBonus = 20;
  }

  // Compute final scores and rank
  const ranked = [...state.players].filter(p => p.connected)
    .map(p => ({ ...p, finalScore: calcScore(p) }))
    .sort((a, b) => b.finalScore - a.finalScore);

  const awards = {
    kingdomHeir: ranked[0],
    secondPlace: ranked[1] || null,
    thirdPlace: ranked[2] || null,
    mostGenerous: [...ranked].sort((a,b) => b.titheTokens - a.titheTokens)[0],
    wisdomKeeper: [...ranked].sort((a,b) => b.wisdomCards - a.wisdomCards)[0],
    pillarOfVirtue: [...ranked].sort((a,b) => (b.virtuePoints||0) - (a.virtuePoints||0))[0],
    masterBuilder: [...ranked].sort((a,b) => b.ministries - a.ministries)[0],
  };

  state.gameOver = { ranked, awards };
  state.phase = 'ended';
  addLog(state, `✦✦ ${awards.kingdomHeir.name} crowned Kingdom Heir! ✦✦`);
}

// ═══════════════════════════════════════════════════════════════
// SOCKET HANDLERS
// ═══════════════════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('create_room', ({ name, heroN, mode }, cb) => {
    const hero = HEROES.find(h => h.n === heroN) || HEROES[0];
    const cleanName = String(name || 'Pilgrim').slice(0, 16).replace(/</g, '');
    const state = createRoom(socket.id, cleanName, hero, mode || 'quick');
    socket.join(state.code);
    socket.data.roomCode = state.code;
    cb({ ok: true, code: state.code, state: getPublicState(state) });
  });

  socket.on('join_room', ({ code, name, heroN }, cb) => {
    const upCode = String(code || '').toUpperCase();
    const state = rooms.get(upCode);
    if (!state) return cb({ ok: false, err: 'Room not found' });
    if (state.phase === 'ended') return cb({ ok: false, err: 'Game finished' });
    const cleanName = String(name || 'Pilgrim').slice(0, 16).replace(/</g, '');
    const existing = state.players.find(p => p.name === cleanName && !p.connected);
    if (existing) {
      existing.id = socket.id;
      existing.connected = true;
      socket.join(state.code);
      socket.data.roomCode = state.code;
      addLog(state, `${existing.name} reconnected`);
      broadcastState(state.code);
      return cb({ ok: true, code: upCode, state: getPublicState(state), reconnected: true });
    }
    if (state.phase !== 'lobby') return cb({ ok: false, err: 'Game in progress' });
    if (state.players.length >= 5) return cb({ ok: false, err: 'Room full (5 max)' });
    const usedHeroes = state.players.map(p => p.heroN);
    let hero = HEROES.find(h => h.n === heroN);
    if (!hero || usedHeroes.includes(hero.n)) hero = HEROES.find(h => !usedHeroes.includes(h.n));
    if (!hero) return cb({ ok: false, err: 'No heroes available' });
    state.players.push(newPlayer(socket.id, cleanName, hero, state.config.startTalents));
    socket.join(state.code);
    socket.data.roomCode = state.code;
    addLog(state, `${cleanName} joined`);
    broadcastState(state.code);
    cb({ ok: true, code: upCode, state: getPublicState(state) });
  });

  socket.on('start_game', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    if (state.hostId !== socket.id) return cb?.({ ok: false, err: 'Only host can start' });
    if (state.players.length < 2) return cb?.({ ok: false, err: 'Need 2+ players' });
    state.phase = 'playing';
    addLog(state, '✦ The journey begins!');
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  socket.on('roll', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: 'Not your turn' });
    if (state.rolled) return cb?.({ ok: false, err: 'Already rolled' });
    if (state.phase !== 'playing') return cb?.({ ok: false });
    if (p.skipTurn) {
      p.skipTurn = false;
      state.rolled = true;
      addLog(state, `${p.name} skipped (paying for compromise)`);
      broadcastState(state.code);
      return cb?.({ ok: true, skipped: true });
    }
    const d1 = Math.floor(Math.random()*6)+1, d2 = Math.floor(Math.random()*6)+1;
    processRoll(state, d1, d2);
    broadcastState(state.code);
    io.to(state.code).emit('dice_rolled', { playerId: socket.id, d1, d2 });
    cb?.({ ok: true, d1, d2 });
  });

  socket.on('draw_card', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.cardOffer) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false });
    drawOfferedCard(state);
    broadcastState(state.code);
    if (state.pendingCard) io.to(state.code).emit('card_drawn', { card: state.pendingCard });
    cb?.({ ok: true });
  });

  socket.on('skip_offer', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.cardOffer) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false });
    addLog(state, `${p.name} declined to draw`);
    state.cardOffer = null;
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  socket.on('apply_card', ({ accepted, triviaAnswer }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false });
    const result = applyCard(state, accepted, triviaAnswer);
    broadcastState(state.code);
    if (result) io.to(state.code).emit('card_resolved', result);
    cb?.({ ok: true });
  });

  socket.on('respond_apostle', ({ accepted }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.apostleEncounter) return cb?.({ ok: false });
    const apostle = state.apostleEncounter;
    const p = state.players.find(pl => pl.id === apostle.playerId);
    if (!p || p.id !== socket.id) return cb?.({ ok: false });
    let outcome;
    if (accepted) {
      const fx = apostle.acceptFx || 0;
      if (apostle.task === 'tithe10pct') {
        const tithe = Math.floor(p.talents * 0.10);
        p.talents -= tithe;
        state.tithePool += tithe;
        p.titheTokens++;
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        outcome = { type:'apostle', apostle, accepted:true, delta:-tithe, vpDelta:apostle.acceptVp||0, message:`${p.name} tithed ${tithe}T (+${apostle.acceptVp||0}V)` };
      } else if (apostle.task === 'gamble' || apostle.task === 'gambleSmall') {
        if (p.talents + fx < 0) return cb?.({ ok: false, err: 'Not enough.' });
        p.talents = Math.max(0, p.talents + fx);
        const win = Math.random() < 0.5;
        if (win) {
          p.talents += apostle.gambleWin;
          if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
          outcome = { type:'apostle-gamble', apostle, accepted:true, won:true, delta:fx+apostle.gambleWin, vpDelta:apostle.acceptVp||0, message:`${p.name} WON ${apostle.gambleWin}T!` };
        } else {
          if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
          outcome = { type:'apostle-gamble', apostle, accepted:true, won:false, delta:fx, vpDelta:apostle.acceptVp||0, message:`${p.name} lost ${Math.abs(fx)}T (faith counted)` };
        }
      } else if (apostle.task === 'giveToPoorest') {
        if (p.talents + fx < 0) return cb?.({ ok: false });
        const poorest = state.players.filter(pl => pl.id !== p.id && pl.connected).sort((a,b)=>a.talents-b.talents)[0];
        p.talents += fx;
        if (poorest) poorest.talents += Math.abs(fx);
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        outcome = { type:'apostle', apostle, accepted:true, delta:fx, vpDelta:apostle.acceptVp||0, message:`${p.name} gave ${Math.abs(fx)}T to ${poorest?.name||'a pilgrim'}` };
      } else if (apostle.task === 'shareToAll') {
        const others = state.players.filter(pl => pl.id !== p.id && pl.connected);
        const cost = (apostle.shareToAll||25) * others.length;
        if (p.talents < cost) return cb?.({ ok: false, err: `Need ${cost}T.` });
        p.talents -= cost;
        others.forEach(pl => pl.talents += apostle.shareToAll);
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        outcome = { type:'apostle', apostle, accepted:true, delta:-cost, vpDelta:apostle.acceptVp||0, message:`${p.name} shared with each pilgrim` };
      } else if (apostle.task === 'buildMinistry') {
        const sp = SPACES[p.pos];
        if (sp.t !== 'property' || p.owned.includes(p.pos) || p.talents < 200) return cb?.({ ok: false, err: 'Cannot build here.' });
        p.talents -= 200;
        p.ministries++;
        p.owned.push(p.pos);
        if (apostle.acceptBonusFx) p.talents += apostle.acceptBonusFx;
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        outcome = { type:'apostle', apostle, accepted:true, delta:-200+(apostle.acceptBonusFx||0), vpDelta:apostle.acceptVp||0, message:`${p.name} built a ministry!` };
      } else if (apostle.task === 'sellForKingdom' || apostle.task === 'donate100') {
        if (p.talents + fx < 0) return cb?.({ ok: false });
        p.talents = Math.max(0, p.talents + fx);
        if (apostle.acceptBonusFx) p.talents += apostle.acceptBonusFx;
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        const net = fx + (apostle.acceptBonusFx||0);
        outcome = { type:'apostle', apostle, accepted:true, delta:net, vpDelta:apostle.acceptVp||0, message:`${p.name} answered ${apostle.name}` };
      } else {
        if (fx) p.talents = Math.max(0, p.talents + fx);
        if (apostle.acceptVp) p.virtuePoints += apostle.acceptVp;
        if (apostle.acceptWisdom) p.wisdomCards += apostle.acceptWisdom;
        outcome = { type:'apostle', apostle, accepted:true, delta:fx, vpDelta:apostle.acceptVp||0, message:`${p.name} responded` };
      }
      awardXp(p, 20);
    } else {
      if (apostle.declineVp) p.virtuePoints += apostle.declineVp;
      outcome = { type:'apostle-declined', apostle, accepted:false, vpDelta:apostle.declineVp||0, message:`${p.name} declined ${apostle.name}` };
    }
    state.apostleEncounter = null;
    // Attach player identity so clients can render watcher toasts
    if (outcome) {
      outcome.playerName = p.name;
      outcome.playerIcon = p.icon;
    }
    broadcastState(state.code);
    io.to(state.code).emit('apostle_resolved', outcome);
    cb?.({ ok: true });
  });

  socket.on('propose_interaction', ({ targetId, interactionId }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const initiator = state.players.find(pl => pl.id === socket.id);
    const target = state.players.find(pl => pl.id === targetId);
    if (!initiator || !target || !target.connected) return cb?.({ ok: false, err: 'Target unavailable' });
    if (initiator.id === target.id) return cb?.({ ok: false });
    const interaction = INTERACTIONS.find(i => i.id === interactionId);
    if (!interaction) return cb?.({ ok: false });
    if (interaction.cost && initiator.talents < interaction.cost) return cb?.({ ok: false, err: `Need ${interaction.cost}T` });
    if (interaction.requiresWealthier && target.talents < initiator.talents * 2) return cb?.({ ok: false, err: 'Target must have 2x your wealth' });
    if (!interaction.requiresAccept) {
      applyInteraction(state, initiator, target, interaction, true);
      broadcastState(state.code);
      io.to(state.code).emit('interaction_resolved', { initiatorName:initiator.name, initiatorIcon:initiator.icon, targetName:target.name, targetIcon:target.icon, interaction, accepted:true });
      return cb?.({ ok: true });
    }
    state.pendingInteraction = {
      initiatorId:initiator.id, initiatorName:initiator.name, initiatorIcon:initiator.icon,
      targetId:target.id, targetName:target.name, targetIcon:target.icon,
      interactionId:interaction.id, isCoLocation: !!state.coLocation,
    };
    addLog(state, `${initiator.name} proposed "${interaction.name}" with ${target.name}`);
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  socket.on('respond_interaction', ({ accepted }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.pendingInteraction) return cb?.({ ok: false });
    const pi = state.pendingInteraction;
    if (pi.targetId !== socket.id) return cb?.({ ok: false });
    const initiator = state.players.find(pl => pl.id === pi.initiatorId);
    const target = state.players.find(pl => pl.id === pi.targetId);
    const interaction = INTERACTIONS.find(i => i.id === pi.interactionId);
    if (!initiator || !target || !interaction) {
      state.pendingInteraction = null; broadcastState(state.code);
      return cb?.({ ok: false });
    }
    applyInteraction(state, initiator, target, interaction, accepted);
    state.pendingInteraction = null;
    state.coLocation = null;
    broadcastState(state.code);
    io.to(state.code).emit('interaction_resolved', { initiatorName:initiator.name, initiatorIcon:initiator.icon, targetName:target.name, targetIcon:target.icon, interaction, accepted });
    cb?.({ ok: true });
  });

  socket.on('skip_colocation', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.coLocation) return cb?.({ ok: false });
    if (state.coLocation.playerAId !== socket.id) return cb?.({ ok: false });
    addLog(state, `${state.coLocation.playerAName} passed peacefully by ${state.coLocation.playerBName}`);
    state.coLocation = null;
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  socket.on('buy_ministry', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false });
    const result = buyMinistry(state);
    broadcastState(state.code);
    if (result.ok) io.to(state.code).emit('ministry_built', { playerName:p.name, playerIcon:p.icon, placeName:result.placeName });
    cb?.(result);
  });

  socket.on('end_turn', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false });
    if (state.cardOffer) return cb?.({ ok: false, err: 'Resolve card offer' });
    if (state.pendingCard) return cb?.({ ok: false, err: 'Resolve card' });
    if (state.apostleEncounter) return cb?.({ ok: false, err: 'Respond to apostle' });
    if (state.coLocation) return cb?.({ ok: false, err: 'Resolve encounter' });
    if (state.pendingInteraction && state.pendingInteraction.isCoLocation) return cb?.({ ok: false, err: 'Wait for response' });
    endTurn(state);
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  socket.on('chat', ({ msg }) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return;
    const p = state.players.find(pl => pl.id === socket.id);
    if (!p) return;
    const clean = String(msg).slice(0, 120).replace(/</g, '&lt;');
    io.to(state.code).emit('chat', { name:p.name, icon:p.icon, msg:clean });
  });

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const state = rooms.get(code);
    if (!state) return;
    const p = state.players.find(pl => pl.id === socket.id);
    if (p) {
      p.connected = false;
      addLog(state, `${p.name} disconnected`);
      if (state.phase === 'lobby' && state.hostId === socket.id && state.players.filter(pl=>pl.connected).length === 0) {
        rooms.delete(code);
        return;
      }
      broadcastState(code);
    }
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, state] of rooms) {
    if (now - state.createdAt > ROOM_TTL_MS) rooms.delete(code);
  }
}, 30 * 60 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✦ Stewardoly server on port ${PORT}`);
});
