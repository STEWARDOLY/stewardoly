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

// ═══════════════════════════════════════════════════════════════
// Card decks — each card has its own personality, like Monopoly's
// Community Chest & Chance cards. Trivia cards have multiple-choice
// questions with one correct answer and risk of penalty if wrong.
// ═══════════════════════════════════════════════════════════════
const CARDS = {
  // ─── SCROLL OF WISDOM (like Chance — bigger swings, fortunes) ───
  'card-w': [
    { icon: '📜', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'The Generous Lender', body: 'You lent to many and borrowed from none. Walk forward 3 spaces and collect 150 Talents.', verse: 'Deut 28:12', fx: 150, advance: 3 },
    { icon: '👑', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'King Solomon Visits', body: 'Solomon shares his wisdom! Gain 200 Talents — but tithe 20T to the Temple.', verse: '1 Kings 3:9', fx: 180 },
    { icon: '🌾', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Year of Abundance', body: 'Bumper harvest! Gain 50T per ministry you own.', verse: 'Lev 26:4', fx: 0, perMinistry: 50 },
    { icon: '🦅', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Soar on Wings of Eagles', body: 'Strength renewed! Advance to the nearest Wisdom space.', verse: 'Isaiah 40:31', fx: 50, advance: 'wisdom' },
    { icon: '💧', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Well of Provision', body: 'Living water provides! Gain 120 Talents from the treasury.', verse: 'John 4:14', fx: 120 },
    { icon: '🍞', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Daily Bread', body: 'Your daily needs are met. Collect 90 Talents.', verse: 'Matt 6:11', fx: 90 },
    { icon: '🕊️', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Peace Be With You', body: 'Conflict resolved! All players give you 20 Talents.', verse: 'John 14:27', fx: 0, fromAll: 20 },
    { icon: '⭐', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Star of Bethlehem', body: 'A great revelation! Advance to the Temple corner directly.', verse: 'Matt 2:9', fx: 0, advanceToCorner: 20 },
    { icon: '🌳', badge: 'Scroll of Wisdom', bcls: 'bw', title: 'Tree by Living Water', body: 'Deeply rooted! Gain 100 Talents and 1 Wisdom card.', verse: 'Psalm 1:3', fx: 100 },
    { icon: '🎵', badge: 'Scroll of Wisdom', bcls: 'bw', title: "David's Song", body: 'A psalm of joy! Gain 70 Talents.', verse: 'Psalm 23', fx: 70 },
  ],

  // ─── ACTS OF APOSTLES (like Community Chest — community/sharing) ───
  'card-a': [
    { icon: '🤝', badge: 'Acts of Apostles', bcls: 'ba', title: 'All Things in Common', body: 'Give 60 Talents to the player with fewest. Love costs something.', verse: 'Acts 2:44', fx: -60, communal: true },
    { icon: '💬', badge: 'Acts of Apostles', bcls: 'ba', title: 'Barnabas Encourages', body: 'A life-giving word spoken over you! Gain 70 Talents.', verse: 'Acts 11:24', fx: 70 },
    { icon: '🏠', badge: 'Acts of Apostles', bcls: 'ba', title: "Lydia's Hospitality", body: 'Generous hospitality! All players gain 40T from the Tithe Pool.', verse: 'Acts 16:15', fx: 40, allPlayers: true },
    { icon: '⛪', badge: 'Acts of Apostles', bcls: 'ba', title: 'Paul Plants a Church', body: 'A new ministry springs up! Gain 1 free Ministry at your space.', verse: '1 Cor 3:6', fx: 0, freeMinistry: true },
    { icon: '🍇', badge: 'Acts of Apostles', bcls: 'ba', title: 'Vineyard Workers', body: 'Latecomers paid the same. Each player receives 30T.', verse: 'Matt 20:1-16', fx: 30, allPlayers: true },
    { icon: '🐟', badge: 'Acts of Apostles', bcls: 'ba', title: 'Loaves & Fishes', body: 'A miracle of multiplication! Your Talents double... up to a max of 200T gained.', verse: 'John 6:1-13', fx: 0, doubleUpTo: 200 },
    { icon: '🦴', badge: 'Acts of Apostles', bcls: 'ba', title: 'The Good Samaritan', body: 'Help a stranger in need. Pay 50T to the player with the lowest Talents.', verse: 'Luke 10:25-37', fx: -50, communal: true },
    { icon: '🏺', badge: 'Acts of Apostles', bcls: 'ba', title: "Widow's Oil Multiplied", body: "Faithful trust pays off! Gain 80T.", verse: '2 Kings 4:1-7', fx: 80 },
    { icon: '🎁', badge: 'Acts of Apostles', bcls: 'ba', title: 'Mission Offering', body: 'You contribute to mission work — pay 40T to the Tithe Pool but gain 1 Wisdom Card.', verse: '2 Cor 9:7', fx: -40 },
    { icon: '🌿', badge: 'Acts of Apostles', bcls: 'ba', title: 'Wash Their Feet', body: 'Servant leadership inspires others. Each player gives you 25T.', verse: 'John 13:14', fx: 0, fromAll: 25 },
  ],

  // ─── PARABLE TRIVIA — 3 difficulty levels with risk/reward scaling ───
  // Easy: low risk/reward (gentle intro)
  // Medium: balanced (fair gamble)
  // Hard: HIGH risk/reward (true expert challenge)
  // Risk increases faster than reward to make Hard a real test of confidence.
  'card-p': [
    // ───── EASY: +60T correct / -30T wrong (2:1 ratio, friendly) ─────
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'How many disciples did Jesus call?',
      options: ['7', '12', '40'], correct: 1, fx: 60, penalty: -30,
      explain: '12 disciples. Matt 10:2-4 lists them all.' },
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'Who built the ark?',
      options: ['Moses', 'Noah', 'Abraham'], correct: 1, fx: 60, penalty: -30,
      explain: 'Noah built the ark. Genesis 6:14.' },
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'What did David use to defeat Goliath?',
      options: ['Sword', 'Sling and stone', 'Spear'], correct: 1, fx: 60, penalty: -30,
      explain: '1 Samuel 17:50 — David used a sling and stone.' },
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'In what city was Jesus born?',
      options: ['Jerusalem', 'Nazareth', 'Bethlehem'], correct: 2, fx: 60, penalty: -30,
      explain: 'Bethlehem. Matthew 2:1.' },
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'Who led the Israelites out of Egypt?',
      options: ['Joshua', 'Moses', 'Aaron'], correct: 1, fx: 60, penalty: -30,
      explain: 'Moses. Exodus 12:31-42.' },
    { icon: '🟢', badge: 'Trivia · Easy', bcls: 'bp', title: 'Easy Trivia', difficulty: 'easy',
      question: 'How many days did God take to create the world?',
      options: ['6', '7', '40'], correct: 0, fx: 60, penalty: -30,
      explain: 'God created in 6 days and rested on the 7th. Genesis 1.' },

    // ───── MEDIUM: +150T correct / -100T wrong (1.5:1 ratio, fair gamble) ─────
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'In the Parable of the Talents, what happened to the servant who buried his talent?',
      options: ['He was praised', 'It was taken and he was cast out', 'He gained two more'],
      correct: 1, fx: 150, penalty: -100,
      explain: 'Matt 25:28-30 — His talent was given to another, and he was cast out.' },
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'What did Zacchaeus promise to give to the poor?',
      options: ['A tenth', 'Half his wealth', 'All his wealth'], correct: 1, fx: 150, penalty: -100,
      explain: 'Luke 19:8 — "Half of my goods I give to the poor."' },
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'How long was Jonah inside the great fish?',
      options: ['1 day', '3 days and 3 nights', '7 days'], correct: 1, fx: 150, penalty: -100,
      explain: 'Jonah 1:17 — three days and three nights.' },
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'In the Parable of the Sower, what type of soil produced fruit?',
      options: ['Rocky soil', 'Thorny soil', 'Good soil'], correct: 2, fx: 150, penalty: -100,
      explain: 'Matt 13:8 — Only the seed on good soil produced fruit.' },
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'The widow who gave two small coins gave more because...',
      options: ['She gave a pretty gift', 'She gave all she had', 'She gave publicly'],
      correct: 1, fx: 150, penalty: -100,
      explain: 'Mark 12:44 — She gave everything she had.' },
    { icon: '🔵', badge: 'Trivia · Medium', bcls: 'bp', title: 'Medium Trivia', difficulty: 'medium',
      question: 'Which book contains the Beatitudes?',
      options: ['Matthew', 'Romans', 'Genesis'], correct: 0, fx: 150, penalty: -100,
      explain: 'Matthew 5 — the Sermon on the Mount.' },

    // ───── HARD: +300T correct / -250T wrong (1.2:1 ratio, real risk!) ─────
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: 'Whom did Jacob meet at the well in Haran?',
      options: ['Leah', 'Rachel', 'Rebekah'], correct: 1, fx: 300, penalty: -250,
      explain: 'Genesis 29:10-11 — Jacob met Rachel at the well.' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: 'In the Parable of the Unmerciful Servant, how much did the servant owe?',
      options: ['100 denarii', '10,000 talents', '1 mina'], correct: 1, fx: 300, penalty: -250,
      explain: 'Matt 18:24 — Ten thousand talents (an enormous debt).' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: 'Which prophet anointed both Saul AND David as king?',
      options: ['Nathan', 'Samuel', 'Elijah'], correct: 1, fx: 300, penalty: -250,
      explain: 'Samuel anointed both — 1 Sam 10:1 (Saul) and 1 Sam 16:13 (David).' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: "In Joseph's dream, what bowed down to him first?",
      options: ['Sun and moon', 'Sheaves of grain', 'Eleven stars'], correct: 1, fx: 300, penalty: -250,
      explain: 'Genesis 37:7 — Sheaves of grain bowed down first.' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: 'How many pieces of silver did Judas receive?',
      options: ['12', '30', '50'], correct: 1, fx: 300, penalty: -250,
      explain: 'Matt 26:15 — Thirty pieces of silver.' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: 'Who was the king of Salem who blessed Abraham?',
      options: ['Melchizedek', 'Pharaoh', 'Abimelech'], correct: 0, fx: 300, penalty: -250,
      explain: 'Genesis 14:18 — Melchizedek, priest of God Most High.' },
    { icon: '🔴', badge: 'Trivia · Hard', bcls: 'bp', title: 'Hard Trivia', difficulty: 'hard',
      question: "What was the name of Hannah's son who became a prophet?",
      options: ['Elisha', 'Samuel', 'Daniel'], correct: 1, fx: 300, penalty: -250,
      explain: '1 Samuel 1:20 — Hannah named her son Samuel.' },
  ],

  // ─── TEMPTATION CARDS — risk vs. resist (like Monopoly's "Go to Jail") ───
  'special': [
    { icon: '🐍', badge: 'Temptation', bcls: 'bt', title: 'Love of Money', body: 'The lure of hoarding whispers. Lose 80T — idols cost more than they pay.', verse: '1 Tim 6:10', fx: -80 },
    { icon: '🏜️', badge: 'Wilderness', bcls: 'bt', title: 'Desert Testing', body: 'A season of trial. Lose a turn but gain 1 Wisdom Card — deserts form character.', verse: 'Hos 2:14', fx: 0, skipTurn: true },
    { icon: '🧂', badge: 'Bitter Waters', bcls: 'bt', title: 'Dead Sea Toll', body: 'A difficult crossing! Pay 60T to the Tithe Pool as a gratitude offering.', verse: 'Psalm 23:4', fx: -60 },
    { icon: '👑', badge: 'Temptation', bcls: 'bt', title: 'Pride of Babylon', body: "Babylon's glamour tempts you. Pay 100T or skip your next turn.", verse: 'Prov 16:18', fx: -100 },
    { icon: '🍷', badge: 'Temptation', bcls: 'bt', title: 'Excess & Riot', body: 'Wasted resources. Lose 50T to the wind.', verse: 'Prov 23:21', fx: -50 },
    { icon: '⚔️', badge: 'Wilderness', bcls: 'bt', title: 'Wandering 40 Years', body: 'Lost in the wilderness. Pay 70T as offering — but gain a Wisdom card.', verse: 'Num 14:33', fx: -70 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PLACE-THEMED CARDS — when a player lands on a property space,
// they can draw a card themed to that biblical location.
// Each place has its own pool of 2-3 themed cards (mix of types).
// ═══════════════════════════════════════════════════════════════
const PLACE_CARDS = {
  'Capernaum': [
    { icon: '🐟', badge: 'Capernaum', bcls: 'ba', title: 'Fishing Boats', body: 'A great catch by the Sea of Galilee! Gain 90 Talents.', verse: 'Luke 5:6', fx: 90 },
    { icon: '🏠', badge: 'Capernaum', bcls: 'ba', title: "Peter's Mother-in-Law Healed", body: 'Healing brings hospitality. All players gain 30T.', verse: 'Mark 1:30-31', fx: 30, allPlayers: true },
    { icon: '✨', badge: 'Capernaum', bcls: 'bw', title: 'Centurion\'s Faith', body: 'Faith from afar! Gain 100T and 1 Wisdom Card.', verse: 'Matt 8:5-13', fx: 100 },
  ],
  'Bethsaida': [
    { icon: '🍞', badge: 'Bethsaida', bcls: 'bw', title: 'Five Loaves & Two Fish', body: '5,000 fed from little! Your Talents increase by 80T.', verse: 'John 6:9', fx: 80 },
    { icon: '👁️', badge: 'Bethsaida', bcls: 'bw', title: 'Blind Man Sees', body: 'Vision restored. Look ahead and gain 70T.', verse: 'Mark 8:22-25', fx: 70 },
  ],
  'Antioch': [
    { icon: '🤝', badge: 'Antioch', bcls: 'ba', title: 'First Called Christians', body: 'A new identity! Each player gains 40T.', verse: 'Acts 11:26', fx: 40, allPlayers: true },
    { icon: '✉️', badge: 'Antioch', bcls: 'ba', title: 'Mission Sent', body: 'Pay 50T to support Paul & Barnabas — but gain 1 Wisdom card.', verse: 'Acts 13:2-3', fx: -50 },
    { icon: '🍞', badge: 'Antioch', bcls: 'ba', title: 'Famine Relief', body: 'Send aid to Jerusalem. Pay 60T to the player with fewest Talents.', verse: 'Acts 11:29', fx: -60, communal: true },
  ],
  'Babylon Gate': [
    { icon: '🐍', badge: 'Babylon', bcls: 'bt', title: 'Tower of Babel', body: 'Pride goes before destruction. Lose 90T.', verse: 'Gen 11:4-9', fx: -90 },
    { icon: '🦁', badge: 'Babylon', bcls: 'bw', title: "Daniel in Lions' Den", body: 'Faith preserved! Gain 120T and 1 Wisdom Card.', verse: 'Daniel 6:22', fx: 120 },
    { icon: '🔥', badge: 'Babylon', bcls: 'bt', title: 'Fiery Furnace', body: 'Refusing the idol! Pay 50T but skip a future Temptation.', verse: 'Daniel 3:25', fx: -50 },
  ],
  'Babylon Ct': [
    { icon: '✍️', badge: 'Babylon', bcls: 'bt', title: 'Writing on the Wall', body: 'Mene Mene Tekel — Belshazzar\'s judgment! Lose 100T.', verse: 'Daniel 5:25', fx: -100 },
    { icon: '👑', badge: 'Babylon', bcls: 'bt', title: 'Nebuchadnezzar\'s Pride', body: 'Brought low for 7 seasons. Skip your next turn.', verse: 'Daniel 4:32', fx: 0, skipTurn: true },
  ],
  'Jordan Ford': [
    { icon: '🕊️', badge: 'Jordan', bcls: 'bw', title: 'Jesus Baptized', body: 'Heavens opened! Gain 110T and 1 Wisdom Card.', verse: 'Matt 3:16-17', fx: 110 },
    { icon: '🌊', badge: 'Jordan', bcls: 'bw', title: 'Crossing on Dry Ground', body: 'Joshua leads through! Advance 4 spaces.', verse: 'Joshua 3:17', fx: 50, advance: 4 },
    { icon: '💧', badge: 'Jordan', bcls: 'bw', title: 'Naaman Cleansed', body: 'Humility heals leprosy. Gain 80T.', verse: '2 Kings 5:14', fx: 80 },
  ],
  'Decapolis': [
    { icon: '🧠', badge: 'Decapolis', bcls: 'bw', title: 'Demoniac Restored', body: 'A man preaches to ten cities! Each player gives you 25T.', verse: 'Mark 5:20', fx: 0, fromAll: 25 },
    { icon: '🐷', badge: 'Decapolis', bcls: 'ba', title: 'Pigs Run Off Cliff', body: 'Lost herd. Pay 60T as commerce loss.', verse: 'Matt 8:32', fx: -60 },
  ],
  'Peraea': [
    { icon: '🤲', badge: 'Peraea', bcls: 'ba', title: 'Beyond the Jordan', body: 'Crowds gathered to listen. Gain 70T.', verse: 'Mark 10:1', fx: 70 },
    { icon: '👶', badge: 'Peraea', bcls: 'ba', title: 'Bless the Children', body: 'Welcoming the little ones! Gain 60T and 1 Wisdom Card.', verse: 'Mark 10:14', fx: 60 },
  ],
  'Machaerus': [
    { icon: '⛓️', badge: 'Machaerus', bcls: 'bt', title: 'John the Baptist Imprisoned', body: 'A prophet held captive. Pay 70T tithe in his memory.', verse: 'Mark 6:17', fx: -70 },
    { icon: '👑', badge: 'Machaerus', bcls: 'bt', title: "Herod's Birthday", body: 'A foolish oath leads to murder. Lose 80T.', verse: 'Mark 6:21-28', fx: -80 },
  ],
  'Dead Sea N': [
    { icon: '🧂', badge: 'Dead Sea', bcls: 'bt', title: "Lot's Wife Looks Back", body: 'Turned to a pillar of salt. Pay 50T.', verse: 'Genesis 19:26', fx: -50 },
    { icon: '🏜️', badge: 'Dead Sea', bcls: 'bw', title: 'Ezekiel\'s Healing River', body: 'Prophecy of restoration! Gain 90T.', verse: 'Ezekiel 47:8-9', fx: 90 },
  ],
  'Dead Sea S': [
    { icon: '🔥', badge: 'Dead Sea', bcls: 'bt', title: 'Sodom & Gomorrah', body: 'Cities destroyed by fire. Lose 70T.', verse: 'Gen 19:24', fx: -70 },
    { icon: '📜', badge: 'Dead Sea', bcls: 'bw', title: 'Dead Sea Scrolls Hidden', body: 'Wisdom preserved for the ages! Gain 100T and 1 Wisdom Card.', verse: 'Discovered 1947', fx: 100 },
  ],
  'Negev': [
    { icon: '🐪', badge: 'Negev', bcls: 'bw', title: "Abraham's Journey", body: 'A pilgrim of faith! Advance 3 spaces and gain 50T.', verse: 'Gen 13:1', fx: 50, advance: 3 },
    { icon: '💧', badge: 'Negev', bcls: 'bw', title: 'Hagar\'s Well', body: 'God provides water in the desert! Gain 80T.', verse: 'Gen 21:19', fx: 80 },
  ],
  'Nile Trade': [
    { icon: '👑', badge: 'Nile', bcls: 'bw', title: "Joseph's Rise", body: 'From prison to Pharaoh\'s court! Gain 130T.', verse: 'Gen 41:41', fx: 130 },
    { icon: '👶', badge: 'Nile', bcls: 'ba', title: 'Moses in the Basket', body: 'A baby saved by faith. Each player gains 35T.', verse: 'Exodus 2:3', fx: 35, allPlayers: true },
    { icon: '🐸', badge: 'Nile', bcls: 'bt', title: 'Plagues of Egypt', body: '"Let my people go!" Pay 90T tribute.', verse: 'Exodus 7-12', fx: -90 },
  ],
  'Sinai': [
    { icon: '📜', badge: 'Sinai', bcls: 'bw', title: 'Ten Commandments', body: 'God\'s law given! Gain 150T and 1 Wisdom Card.', verse: 'Exodus 20', fx: 150 },
    { icon: '🔥', badge: 'Sinai', bcls: 'bw', title: 'Burning Bush', body: '"I AM" speaks. Gain 100T.', verse: 'Exodus 3:14', fx: 100 },
    { icon: '🐂', badge: 'Sinai', bcls: 'bt', title: 'Golden Calf', body: 'Idolatry! Lose 100T to be melted down.', verse: 'Exodus 32:4', fx: -100 },
  ],
  'Hebron': [
    { icon: '🏔️', badge: 'Hebron', bcls: 'bw', title: 'Caleb Inherits', body: '"Wholly followed the Lord!" Gain 100T.', verse: 'Joshua 14:14', fx: 100 },
    { icon: '👑', badge: 'Hebron', bcls: 'bw', title: 'David Anointed King', body: 'Crowned at Hebron! Gain 110T.', verse: '2 Sam 5:3', fx: 110 },
  ],
  'Judea Hills': [
    { icon: '⛪', badge: 'Judea', bcls: 'ba', title: 'Visit to Elizabeth', body: 'Mary visits Elizabeth — joy multiplied! Each player gains 30T.', verse: 'Luke 1:39-45', fx: 30, allPlayers: true },
    { icon: '🌿', badge: 'Judea', bcls: 'bw', title: 'John in the Wilderness', body: 'Prepare the way! Gain 70T.', verse: 'Matt 3:1-3', fx: 70 },
  ],
  'Nazareth': [
    { icon: '🌟', badge: 'Nazareth', bcls: 'bw', title: 'Annunciation', body: '"Greetings, favored one!" Gain 120T and 1 Wisdom Card.', verse: 'Luke 1:28', fx: 120 },
    { icon: '🔨', badge: 'Nazareth', bcls: 'ba', title: 'Carpenter\'s Workshop', body: 'Honest work prospers. Gain 60T per ministry you own.', verse: 'Mark 6:3', fx: 0, perMinistry: 60 },
    { icon: '🔥', badge: 'Nazareth', bcls: 'bt', title: 'Rejected at Hometown', body: 'A prophet not honored among his own. Lose 50T.', verse: 'Luke 4:29', fx: -50 },
  ],
  'Mt Carmel': [
    { icon: '🔥', badge: 'Mt Carmel', bcls: 'bw', title: "Elijah's Showdown", body: 'Fire from heaven! Gain 130T.', verse: '1 Kings 18:38', fx: 130 },
    { icon: '☔', badge: 'Mt Carmel', bcls: 'bw', title: 'End of Drought', body: 'Rain after 3 years! Each player gains 40T.', verse: '1 Kings 18:45', fx: 40, allPlayers: true },
  ],
  'Jerusalem': [
    { icon: '👑', badge: 'Jerusalem', bcls: 'bw', title: 'David\'s Capital', body: 'The City of God! Gain 150T.', verse: '2 Sam 5:7', fx: 150 },
    { icon: '🌿', badge: 'Jerusalem', bcls: 'bw', title: 'Triumphal Entry', body: 'Hosanna! Each player gives you 30T.', verse: 'Matt 21:9', fx: 0, fromAll: 30 },
    { icon: '✝️', badge: 'Jerusalem', bcls: 'bw', title: 'Resurrection Morning', body: 'He is risen! Gain 200T and 1 Wisdom Card.', verse: 'Matt 28:6', fx: 200 },
  ],
  'Zion Gate': [
    { icon: '🏛️', badge: 'Zion', bcls: 'bw', title: 'Temple Cleansed', body: '"My house shall be a house of prayer." Gain 90T from the Tithe Pool.', verse: 'Matt 21:13', fx: 90 },
    { icon: '🕊️', badge: 'Zion', bcls: 'ba', title: 'Pentecost Outpouring', body: '3,000 added in a day! All players gain 50T.', verse: 'Acts 2:41', fx: 50, allPlayers: true },
  ],
  'Samaria': [
    { icon: '💧', badge: 'Samaria', bcls: 'bw', title: 'Woman at the Well', body: 'Living water given! Gain 100T.', verse: 'John 4:14', fx: 100 },
    { icon: '🤝', badge: 'Samaria', bcls: 'ba', title: 'Good Samaritan', body: 'Mercy crosses borders. Pay 50T to the player with fewest.', verse: 'Luke 10:33-37', fx: -50, communal: true },
  ],
  'Sychar': [
    { icon: '🪣', badge: 'Sychar', bcls: 'bw', title: 'Jacob\'s Well', body: 'Ancient well, fresh revelation. Gain 80T.', verse: 'John 4:6', fx: 80 },
    { icon: '🌾', badge: 'Sychar', bcls: 'ba', title: 'Harvest is Ready', body: '"Lift up your eyes!" Gain 50T per ministry you own.', verse: 'John 4:35', fx: 0, perMinistry: 50 },
  ],
  'Mt Gerizim': [
    { icon: '🙌', badge: 'Mt Gerizim', bcls: 'bw', title: 'Mount of Blessing', body: 'Blessings proclaimed from the mountain! Gain 100T.', verse: 'Deut 11:29', fx: 100 },
    { icon: '⛰️', badge: 'Mt Gerizim', bcls: 'bw', title: 'True Worship', body: '"In spirit and in truth." Gain 90T and 1 Wisdom card.', verse: 'John 4:23', fx: 90 },
  ],
  'Tiberias': [
    { icon: '⚓', badge: 'Tiberias', bcls: 'ba', title: 'Sea of Tiberias Catch', body: '153 fish caught! Each player gains 30T.', verse: 'John 21:11', fx: 30, allPlayers: true },
    { icon: '🍞', badge: 'Tiberias', bcls: 'bw', title: 'Breakfast on the Shore', body: 'Restoration after denial. Gain 90T.', verse: 'John 21:12', fx: 90 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// APOSTLE NPCs — random encounters that appear ~12% of the time
// when a player rolls. Each apostle offers a task or blessing.
// ═══════════════════════════════════════════════════════════════
const APOSTLES = [
  { id:'paul',  emj:'✉️', name:'Paul of Tarsus',
    intro:'Paul appears with a mission!',
    body:'"Support the Antioch church-planting mission. Will you contribute 100T? Those who give freely will receive grace upon grace."',
    verse:'2 Cor 9:7',
    task:'donate100', acceptFx:-100, acceptReward:{ wisdomCards:2, xp:30, talents:0 },
    declineFx:0,
    quote:'"He who supplies seed to the sower will multiply your seed." — 2 Cor 9:10' },
  { id:'peter', emj:'🗝️', name:'Simon Peter',
    intro:'Peter the fisherman calls out to you!',
    body:'"Cast your nets on the right side! Take a leap of faith — gamble 80T on the catch. 50/50: win 200T, or lose your stake."',
    verse:'John 21:6',
    task:'gamble', acceptFx:-80, gamble:true,
    quote:'"Lord, if it is you, command me to come to you on the water." — Matt 14:28' },
  { id:'john',  emj:'❤️', name:'John the Beloved',
    intro:'John the Beloved meets you on the road!',
    body:'"Love your neighbor — give 60T to the player with the fewest Talents. Love is the fulfillment of the law."',
    verse:'1 John 4:7',
    task:'giveToPoorest', acceptFx:-60, acceptReward:{ xp:25, wisdomCards:1, talents:30 },
    quote:'"Beloved, let us love one another." — 1 John 4:7' },
  { id:'james', emj:'⚖️', name:'James the Just',
    intro:'James, brother of the Lord, raises his voice!',
    body:'"Faith without works is dead! Build a ministry now (if you can afford it) for a +50T blessing AND 1 wisdom card."',
    verse:'James 2:17',
    task:'buildMinistry', acceptReward:{ talents:50, wisdomCards:1, xp:25 },
    quote:'"Pure religion is to care for orphans and widows." — James 1:27' },
  { id:'mary',  emj:'🌹', name:'Mary of Bethany',
    intro:'Mary anoints your feet with costly perfume!',
    body:'"Pour out all you have in worship. Tithe 10% of your Talents to the Tithe Pool — and gain great spiritual reward."',
    verse:'John 12:3',
    task:'tithe10pct', acceptReward:{ wisdomCards:2, xp:30 },
    quote:'"She has done a beautiful thing to me." — Mark 14:6' },
  { id:'andrew', emj:'🐟', name:'Andrew',
    intro:'Andrew brings someone to meet you!',
    body:'"Bring a friend — invite all players to gain 25T each. Generosity multiplied!"',
    verse:'John 1:42',
    task:'shareToAll', acceptFx:0, acceptReward:{ xp:20, wisdomCards:1 }, shareToAll:25,
    quote:'"We have found the Messiah!" — John 1:41' },
  { id:'barnabas', emj:'💛', name:'Barnabas',
    intro:'Barnabas the Encourager comes alongside you!',
    body:'"Sell some land for the kingdom — sacrifice 50T but gain 1 ministry star elsewhere (+50pts of ministry value)."',
    verse:'Acts 4:36-37',
    task:'sellForKingdom', acceptFx:-50, acceptReward:{ wisdomCards:1, xp:20, talents:100 },
    quote:'"He sold a field he owned and brought the money..." — Acts 4:37' },
  { id:'thomas', emj:'🔍', name:'Thomas the Doubter',
    intro:'Thomas appears with a question of faith.',
    body:'"Do you trust without seeing? Risk 50T on faith — flip a coin. Win 150T or lose your offering."',
    verse:'John 20:29',
    task:'gambleSmall', acceptFx:-50, gamble:true, gambleWin:150,
    quote:'"Blessed are those who have not seen and yet have believed." — John 20:29' },
];

// ═══════════════════════════════════════════════════════════════
// INTERACTIONS — actions a player can propose to another player.
// Some are free (encouragement), some cost Talents, some are gambles.
// All require BOTH players to be connected.
// ═══════════════════════════════════════════════════════════════
const INTERACTIONS = [
  { id:'encourage', emj:'💛', name:'Encourage',
    desc:'Pay 30T to give a fellow pilgrim a 50T blessing.',
    cost:30, requiresAccept:false, autoApply:'encourage' },
  { id:'pray',      emj:'🙏', name:'Pray Together',
    desc:'Pray together — both players gain 1 Wisdom Card and 20 XP. Free!',
    cost:0, requiresAccept:true, autoApply:'pray' },
  { id:'trade',     emj:'🤝', name:'Tithe-Trade',
    desc:'Pay 80T to swap positions on the board. Useful when stuck or to dodge a hostile space.',
    cost:80, requiresAccept:true, autoApply:'trade' },
  { id:'challenge', emj:'⚔️', name:'Wisdom Duel',
    desc:'Challenge a fellow pilgrim to a Bible trivia duel! Winner takes 100T from loser.',
    cost:0, requiresAccept:true, autoApply:'duel' },
  { id:'tax-collector', emj:'🧾', name:'Tax Collector',
    desc:'Demand 60T from a wealthy player (only works if they have 2x your Talents). Risky — they may refuse.',
    cost:0, requiresAccept:true, requiresWealthier:true, autoApply:'tax' },
];

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
    hostId: state.hostId,
    players: state.players,
    currentPlayerIndex: state.currentPlayerIndex,
    round: state.round,
    tithePool: state.tithePool,
    rolled: state.rolled,
    log: state.log.slice(-20),
    pendingCard: state.pendingCard,
    cardOffer: state.cardOffer,
    apostleEncounter: state.apostleEncounter,
    coLocation: state.coLocation,
    pendingInteraction: state.pendingInteraction,
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
  // Clear stale events from previous turn
  state.apostleEncounter = null;
  state.coLocation = null;

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

  // ─── CO-LOCATION DETECTION ───
  // If another player is on the same space, mandatory interaction!
  const others = state.players.filter(pl =>
    pl.id !== p.id && pl.connected && pl.pos === newPos
  );
  if (others.length > 0) {
    // Pick the first other player on this space (could extend to multi-player)
    const other = others[0];
    state.coLocation = {
      playerAId: p.id,
      playerAName: p.name,
      playerAIcon: p.icon,
      playerBId: other.id,
      playerBName: other.name,
      playerBIcon: other.icon,
      placeName: SPACES[newPos].n,
    };
    addLog(state, `⚔ ${p.name} encounters ${other.name} at ${SPACES[newPos].n}!`);
  }

  // ─── APOSTLE NPC ENCOUNTER (~12% chance, but not on corner/tax) ───
  const sp = SPACES[newPos];
  let cardOffer = null;
  let apostleRolled = false;

  if (sp.t === 'tax') {
    const tithe = Math.floor(p.talents * 0.10);
    p.talents -= tithe;
    state.tithePool += tithe;
    p.titheTokens++;
    addLog(state, `${p.name} tithed ${tithe}T ⚖`);
  } else if (sp.t === 'corner') {
    handleCorner(state, p, newPos);
  } else if (CARDS[sp.t] || sp.t === 'special') {
    // Card spaces: 20% chance of apostle replacing the card offer
    if (Math.random() < 0.20) {
      const apostle = APOSTLES[Math.floor(Math.random() * APOSTLES.length)];
      state.apostleEncounter = { ...apostle, playerId: p.id, placeName: sp.n };
      apostleRolled = true;
      addLog(state, `✨ ${apostle.emj} ${apostle.name} appears before ${p.name}!`);
    } else {
      const cardType = sp.t === 'special' ? 'special' : sp.t;
      state.cardOffer = { cardType, playerId: p.id, placeName: sp.n };
      cardOffer = { cardType, placeName: sp.n };
      addLog(state, `${p.name} can draw a ${cardTypeLabel(cardType)} card`);
    }
  } else if (sp.t === 'property' && PLACE_CARDS[sp.n]) {
    // Property: 12% apostle, otherwise place card offer
    if (Math.random() < 0.12) {
      const apostle = APOSTLES[Math.floor(Math.random() * APOSTLES.length)];
      state.apostleEncounter = { ...apostle, playerId: p.id, placeName: sp.n };
      apostleRolled = true;
      addLog(state, `✨ ${apostle.emj} ${apostle.name} appears before ${p.name}!`);
    } else {
      state.cardOffer = { cardType: 'place', playerId: p.id, placeName: sp.n };
      cardOffer = { cardType: 'place', placeName: sp.n };
      addLog(state, `${p.name} can draw a ${sp.n} story card`);
    }
  }

  return { roll: [d1, d2], cardOffer, apostleRolled };
}

function cardTypeLabel(t) {
  return t==='card-w' ? 'Wisdom' :
         t==='card-a' ? 'Acts' :
         t==='card-p' ? 'Parable' :
         t==='special' ? 'Temptation' : 'card';
}

// Player chose to draw the card from the offer
function drawOfferedCard(state) {
  if (!state.cardOffer) return null;
  const offer = state.cardOffer;
  let card;

  if (offer.cardType === 'place' && PLACE_CARDS[offer.placeName]) {
    // Draw from the place-themed pool
    const pool = PLACE_CARDS[offer.placeName];
    card = pool[Math.floor(Math.random() * pool.length)];
  } else {
    card = pickCard(offer.cardType);
  }

  state.pendingCard = { ...card, drawerId: offer.playerId };
  state.cardOffer = null;
  const p = state.players.find(pl => pl.id === state.pendingCard.drawerId);
  if (p) addLog(state, `${p.name} drew: ${card.title || 'a trivia card'}`);
  return card;
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

function applyCard(state, accepted, triviaAnswerIdx) {
  const card = state.pendingCard;
  if (!card) return null;
  const p = state.players[state.currentPlayerIndex];

  // ─── TRIVIA CARDS (have options + correct answer) ───
  if (card.options && typeof card.correct === 'number') {
    if (!accepted) {
      addLog(state, `${p.name} skipped the trivia challenge`);
      state.pendingCard = null;
      return { type: 'trivia-skipped', playerName: p.name, playerIcon: p.icon, card };
    }
    if (typeof triviaAnswerIdx !== 'number') {
      addLog(state, `${p.name} attempted trivia without an answer`);
      state.pendingCard = null;
      return { type: 'trivia-noanswer', playerName: p.name, playerIcon: p.icon, card };
    }
    const isCorrect = triviaAnswerIdx === card.correct;
    if (isCorrect) {
      p.talents += card.fx;
      p.wisdomCards++;
      addLog(state, `✓ ${p.name} answered correctly! Gained ${card.fx}T 🎉`);
    } else {
      p.talents = Math.max(0, p.talents + card.penalty);
      addLog(state, `✗ ${p.name} answered wrong (correct was: "${card.options[card.correct]}"). Lost ${Math.abs(card.penalty)}T`);
    }
    state.pendingCard = null;
    return {
      type: 'trivia',
      playerName: p.name,
      playerIcon: p.icon,
      card,
      answerIdx: triviaAnswerIdx,
      correct: isCorrect,
      delta: isCorrect ? card.fx : card.penalty
    };
  }

  // ─── REGULAR CARDS ───
  let totalGained = 0;
  if (accepted) {
    let gained = card.fx || 0;

    // Per-ministry bonus (Year of Abundance)
    if (card.perMinistry) {
      gained += card.perMinistry * p.ministries;
      addLog(state, `Year of Abundance — ${p.ministries} ministries × ${card.perMinistry}T = +${card.perMinistry * p.ministries}T`);
    }

    // Double up to a cap
    if (card.doubleUpTo) {
      const dub = Math.min(p.talents, card.doubleUpTo);
      gained += dub;
      addLog(state, `Talents doubled by +${dub}T (Loaves & Fishes)`);
    }

    // From all other players
    if (card.fromAll) {
      const others = state.players.filter(pl => pl.id !== p.id && pl.connected);
      others.forEach(pl => {
        const give = Math.min(card.fromAll, pl.talents);
        pl.talents -= give;
        gained += give;
      });
      addLog(state, `${p.name} received ${others.length}×${card.fromAll}T from other pilgrims`);
    }

    // Apply gain/loss
    if (gained > 0) {
      p.talents += gained;
      p.wisdomCards++;
      addLog(state, `${p.name} gained ${gained}T ✦`);
    } else if (gained < 0) {
      p.talents = Math.max(0, p.talents + gained);
      addLog(state, `${p.name} paid ${Math.abs(gained)}T`);
    }
    totalGained = gained;

    // Free ministry
    if (card.freeMinistry && !p.owned.includes(p.pos) && SPACES[p.pos].t === 'property') {
      p.ministries++;
      p.owned.push(p.pos);
      addLog(state, `${p.name} built a free Ministry!`);
    }

    // All players gain
    if (card.allPlayers && card.fx > 0) {
      state.players.filter(pl => pl.id !== p.id && pl.connected).forEach(pl => {
        pl.talents += card.fx;
      });
      addLog(state, `All pilgrims received ${card.fx}T!`);
    }

    // Communal — give to poorest
    if (card.communal && card.fx < 0) {
      const poorest = state.players.filter(pl => pl.id !== p.id && pl.connected)
        .sort((a, b) => a.talents - b.talents)[0];
      if (poorest) {
        poorest.talents += Math.abs(card.fx);
        addLog(state, `${poorest.name} received ${Math.abs(card.fx)}T from ${p.name}`);
      }
    }

    // Advance N spaces
    if (card.advance && typeof card.advance === 'number') {
      p.pos = (p.pos + card.advance) % 40;
      addLog(state, `${p.name} advanced ${card.advance} spaces to ${SPACES[p.pos].n}`);
    }

    // Advance to corner
    if (card.advanceToCorner !== undefined) {
      p.pos = card.advanceToCorner;
      addLog(state, `${p.name} advanced to ${SPACES[p.pos].n}`);
    }

    // Skip next turn
    if (card.skipTurn) {
      p.skipTurn = true;
      addLog(state, `${p.name} will skip their next turn`);
    }
  } else {
    addLog(state, `${p.name} skipped the card`);
  }
  state.pendingCard = null;
  return {
    type: accepted ? 'card' : 'card-skipped',
    playerName: p.name,
    playerIcon: p.icon,
    card,
    delta: totalGained
  };
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

// Apply an interaction outcome to two players
function applyInteraction(state, initiator, target, interaction, accepted) {
  if (!accepted) {
    addLog(state, `${target.name} declined ${initiator.name}'s "${interaction.name}"`);
    return;
  }
  switch (interaction.id) {
    case 'encourage':
      initiator.talents = Math.max(0, initiator.talents - interaction.cost);
      target.talents += 50;
      addLog(state, `${initiator.name} encouraged ${target.name} (+50T blessing)`);
      break;
    case 'pray':
      initiator.wisdomCards++;
      target.wisdomCards++;
      addLog(state, `${initiator.name} & ${target.name} prayed together — both gained wisdom`);
      break;
    case 'trade': {
      // Swap positions
      initiator.talents = Math.max(0, initiator.talents - interaction.cost);
      const tmp = initiator.pos;
      initiator.pos = target.pos;
      target.pos = tmp;
      addLog(state, `${initiator.name} & ${target.name} swapped positions on the map`);
      break;
    }
    case 'duel': {
      // Wisdom Duel — coin flip for now (could expand to a real trivia later)
      const initiatorWins = Math.random() < 0.5;
      if (initiatorWins) {
        const amt = Math.min(100, target.talents);
        target.talents -= amt;
        initiator.talents += amt;
        addLog(state, `⚔ ${initiator.name} won the Wisdom Duel! Took ${amt}T from ${target.name}`);
      } else {
        const amt = Math.min(100, initiator.talents);
        initiator.talents -= amt;
        target.talents += amt;
        addLog(state, `⚔ ${target.name} won the Wisdom Duel! Took ${amt}T from ${initiator.name}`);
      }
      break;
    }
    case 'tax-collector': {
      const amt = Math.min(60, target.talents);
      target.talents -= amt;
      initiator.talents += amt;
      addLog(state, `🧾 ${initiator.name} collected ${amt}T from ${target.name}`);
      break;
    }
  }
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
  state.cardOffer = null;
  state.apostleEncounter = null;
  state.coLocation = null;
  // Don't clear pendingInteraction — interactions can span turns
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
      const wasHost = state.hostId === existing.id;
      existing.id = socket.id;
      existing.connected = true;
      // If this player was the host, update hostId to new socket.id
      if (wasHost) state.hostId = socket.id;
      addLog(state, `${existing.name} rejoined the room ✦`);
      socket.join(code.toUpperCase());
      socket.data.roomCode = code.toUpperCase();
      socket.data.playerId = socket.id;
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
    cb?.({ ok: true, d1, d2 });
  });

  // Player chooses to DRAW the offered card
  socket.on('draw_card', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    if (!state.cardOffer) return cb?.({ ok: false, err: 'No card offered.' });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    const card = drawOfferedCard(state);
    broadcastState(state.code);
    if (card) io.to(state.code).emit('card_drawn', { card: state.pendingCard });
    cb?.({ ok: true });
  });

  // Player chooses to SKIP the offered card (don't draw at all)
  socket.on('skip_offer', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    if (!state.cardOffer) return cb?.({ ok: false, err: 'No card offered.' });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    addLog(state, `${p.name} declined to draw a card`);
    state.cardOffer = null;
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  // Apply or skip card (after drawn). For trivia, also includes triviaAnswer index.
  socket.on('apply_card', ({ accepted, triviaAnswer }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    const result = applyCard(state, accepted, triviaAnswer);
    broadcastState(state.code);
    if (result) {
      io.to(state.code).emit('card_resolved', result);
    }
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
    if (result.ok) {
      const sp = SPACES[p.pos];
      io.to(state.code).emit('ministry_built', {
        playerName: p.name,
        playerIcon: p.icon,
        placeName: sp.n,
      });
    }
    cb?.(result);
  });

  // ─── APOSTLE: respond to encounter ───
  socket.on('respond_apostle', ({ accepted }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.apostleEncounter) return cb?.({ ok: false });
    const apostle = state.apostleEncounter;
    const p = state.players.find(pl => pl.id === apostle.playerId);
    if (!p || p.id !== socket.id) return cb?.({ ok: false, err: "Not your encounter." });

    let outcome = null;
    if (accepted) {
      // Pay the cost first
      const fx = apostle.acceptFx || 0;

      // Validate ability to accept
      if (apostle.task === 'tithe10pct') {
        const tithe = Math.floor(p.talents * 0.10);
        p.talents -= tithe;
        state.tithePool += tithe;
        p.titheTokens++;
        outcome = { type: 'apostle', apostle, accepted: true, delta: -tithe, message: `${p.name} tithed ${tithe}T at ${apostle.name}'s call` };
        addLog(state, `${p.name} tithed ${tithe}T to ${apostle.name}`);
      } else if (apostle.task === 'gamble' || apostle.task === 'gambleSmall') {
        // Pay stake; flip coin
        if (p.talents + fx < 0) {
          return cb?.({ ok: false, err: 'Not enough Talents to take this risk.' });
        }
        p.talents = Math.max(0, p.talents + fx);
        const win = Math.random() < 0.5;
        const winAmount = apostle.gambleWin || 200;
        if (win) {
          p.talents += winAmount;
          outcome = { type: 'apostle-gamble', apostle, accepted: true, won: true, delta: fx + winAmount, message: `${p.name} won the gamble! +${winAmount}T` };
          addLog(state, `🎲 ${p.name} took the leap of faith and WON ${winAmount}T!`);
        } else {
          outcome = { type: 'apostle-gamble', apostle, accepted: true, won: false, delta: fx, message: `${p.name} lost the gamble. (${fx}T)` };
          addLog(state, `🎲 ${p.name} took the leap of faith and lost ${Math.abs(fx)}T`);
        }
      } else if (apostle.task === 'giveToPoorest') {
        if (p.talents + fx < 0) return cb?.({ ok: false, err: 'Not enough Talents.' });
        const poorest = state.players.filter(pl => pl.id !== p.id && pl.connected).sort((a,b)=>a.talents-b.talents)[0];
        p.talents += fx; // negative
        if (poorest) poorest.talents += Math.abs(fx);
        // Plus reward
        if (apostle.acceptReward?.talents) p.talents += apostle.acceptReward.talents;
        if (apostle.acceptReward?.wisdomCards) p.wisdomCards += apostle.acceptReward.wisdomCards;
        outcome = { type: 'apostle', apostle, accepted: true, delta: fx + (apostle.acceptReward?.talents||0), message: `${p.name} gave ${Math.abs(fx)}T to ${poorest?.name||'a poor pilgrim'} (+ blessings)` };
        addLog(state, `${p.name} gave ${Math.abs(fx)}T to ${poorest?.name||'a pilgrim'}`);
      } else if (apostle.task === 'shareToAll') {
        const others = state.players.filter(pl => pl.id !== p.id && pl.connected);
        const cost = (apostle.shareToAll || 25) * others.length;
        if (p.talents < cost) return cb?.({ ok: false, err: `Need ${cost}T to share with all.` });
        p.talents -= cost;
        others.forEach(pl => pl.talents += apostle.shareToAll);
        if (apostle.acceptReward?.wisdomCards) p.wisdomCards += apostle.acceptReward.wisdomCards;
        outcome = { type: 'apostle', apostle, accepted: true, delta: -cost, message: `${p.name} shared ${apostle.shareToAll}T with each pilgrim` };
        addLog(state, `${p.name} shared ${apostle.shareToAll}T with everyone`);
      } else if (apostle.task === 'buildMinistry') {
        const sp = SPACES[p.pos];
        if (sp.t !== 'property' || p.owned.includes(p.pos) || p.talents < 200) {
          return cb?.({ ok: false, err: 'Cannot build a ministry here right now.' });
        }
        p.talents -= 200;
        p.ministries++;
        p.owned.push(p.pos);
        if (apostle.acceptReward?.talents) p.talents += apostle.acceptReward.talents;
        if (apostle.acceptReward?.wisdomCards) p.wisdomCards += apostle.acceptReward.wisdomCards;
        outcome = { type: 'apostle', apostle, accepted: true, delta: -200 + (apostle.acceptReward?.talents||0), message: `${p.name} built a ministry at ${apostle.name}'s urging!` };
        addLog(state, `${p.name} built a ministry inspired by ${apostle.name}`);
      } else if (apostle.task === 'sellForKingdom' || apostle.task === 'donate100') {
        if (p.talents + fx < 0) return cb?.({ ok: false, err: 'Not enough Talents.' });
        p.talents = Math.max(0, p.talents + fx);
        if (apostle.acceptReward?.talents) p.talents += apostle.acceptReward.talents;
        if (apostle.acceptReward?.wisdomCards) p.wisdomCards += apostle.acceptReward.wisdomCards;
        const net = fx + (apostle.acceptReward?.talents||0);
        outcome = { type: 'apostle', apostle, accepted: true, delta: net, message: `${p.name} answered ${apostle.name}'s call (${net>=0?'+':''}${net}T net)` };
        addLog(state, `${p.name} responded to ${apostle.name}: ${fx}T given, blessings received`);
      } else {
        // Generic: just apply fx and reward
        if (fx) p.talents = Math.max(0, p.talents + fx);
        if (apostle.acceptReward?.talents) p.talents += apostle.acceptReward.talents;
        if (apostle.acceptReward?.wisdomCards) p.wisdomCards += apostle.acceptReward.wisdomCards;
        outcome = { type: 'apostle', apostle, accepted: true, delta: (fx||0) + (apostle.acceptReward?.talents||0), message: `${p.name} responded to ${apostle.name}` };
        addLog(state, `${p.name} responded to ${apostle.name}`);
      }
    } else {
      outcome = { type: 'apostle-declined', apostle, accepted: false, message: `${p.name} respectfully declined ${apostle.name}` };
      addLog(state, `${p.name} declined ${apostle.name}'s offer`);
    }

    state.apostleEncounter = null;
    broadcastState(state.code);
    io.to(state.code).emit('apostle_resolved', outcome);
    cb?.({ ok: true });
  });

  // ─── INTERACTION: propose ───
  socket.on('propose_interaction', ({ targetId, interactionId }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const initiator = state.players.find(pl => pl.id === socket.id);
    const target = state.players.find(pl => pl.id === targetId);
    if (!initiator || !target || !target.connected) return cb?.({ ok: false, err: 'Target not available' });
    if (initiator.id === target.id) return cb?.({ ok: false, err: 'Cannot interact with yourself' });
    const interaction = INTERACTIONS.find(i => i.id === interactionId);
    if (!interaction) return cb?.({ ok: false, err: 'Unknown interaction' });

    // Validate cost
    if (interaction.cost && initiator.talents < interaction.cost) {
      return cb?.({ ok: false, err: `Need ${interaction.cost}T for this.` });
    }
    // Wealth check (Tax Collector requires target to have 2x)
    if (interaction.requiresWealthier && target.talents < initiator.talents * 2) {
      return cb?.({ ok: false, err: 'Target must have 2x your Talents.' });
    }

    // If no acceptance needed, apply immediately
    if (!interaction.requiresAccept) {
      applyInteraction(state, initiator, target, interaction, true);
      broadcastState(state.code);
      io.to(state.code).emit('interaction_resolved', {
        initiatorName: initiator.name, initiatorIcon: initiator.icon,
        targetName: target.name, targetIcon: target.icon,
        interaction, accepted: true,
      });
      return cb?.({ ok: true });
    }

    // Otherwise, set pendingInteraction so target can respond
    state.pendingInteraction = {
      initiatorId: initiator.id, initiatorName: initiator.name, initiatorIcon: initiator.icon,
      targetId: target.id, targetName: target.name, targetIcon: target.icon,
      interactionId: interaction.id,
      isCoLocation: !!state.coLocation,
    };
    addLog(state, `${initiator.name} proposed "${interaction.name}" with ${target.name}`);
    broadcastState(state.code);
    cb?.({ ok: true });
  });

  // ─── INTERACTION: respond ───
  socket.on('respond_interaction', ({ accepted }, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.pendingInteraction) return cb?.({ ok: false });
    const pi = state.pendingInteraction;
    if (pi.targetId !== socket.id) return cb?.({ ok: false, err: 'Not for you' });
    const initiator = state.players.find(pl => pl.id === pi.initiatorId);
    const target = state.players.find(pl => pl.id === pi.targetId);
    const interaction = INTERACTIONS.find(i => i.id === pi.interactionId);
    if (!initiator || !target || !interaction) {
      state.pendingInteraction = null;
      broadcastState(state.code);
      return cb?.({ ok: false });
    }
    applyInteraction(state, initiator, target, interaction, accepted);
    state.pendingInteraction = null;
    // Clear coLocation since interaction is resolved
    state.coLocation = null;
    broadcastState(state.code);
    io.to(state.code).emit('interaction_resolved', {
      initiatorName: initiator.name, initiatorIcon: initiator.icon,
      targetName: target.name, targetIcon: target.icon,
      interaction, accepted,
    });
    cb?.({ ok: true });
  });

  // ─── INTERACTION: cancel/skip co-location interaction ───
  socket.on('skip_colocation', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state || !state.coLocation) return cb?.({ ok: false });
    if (state.coLocation.playerAId !== socket.id) return cb?.({ ok: false, err: 'Not your move' });
    addLog(state, `${state.coLocation.playerAName} passed peacefully by ${state.coLocation.playerBName}`);
    state.coLocation = null;
    broadcastState(state.code);
    cb?.({ ok: true });
  });
  // End turn
  socket.on('end_turn', (_, cb) => {
    const state = rooms.get(socket.data.roomCode);
    if (!state) return cb?.({ ok: false });
    const p = state.players[state.currentPlayerIndex];
    if (p.id !== socket.id) return cb?.({ ok: false, err: "Not your turn." });
    if (state.cardOffer) return cb?.({ ok: false, err: 'Resolve the card offer first.' });
    if (state.pendingCard) return cb?.({ ok: false, err: 'Resolve the card first.' });
    if (state.apostleEncounter) return cb?.({ ok: false, err: 'Respond to the apostle first.' });
    if (state.coLocation) return cb?.({ ok: false, err: 'Resolve your encounter first.' });
    if (state.pendingInteraction && state.pendingInteraction.isCoLocation) {
      return cb?.({ ok: false, err: 'Wait for the other player to respond.' });
    }
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
