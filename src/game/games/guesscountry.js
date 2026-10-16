// Guess Country — everyone gets the same shuffled sequence of country
// silhouettes (the frontend renders the actual shape; this game only decides
// which country is "up" and judges answers) but moves through it at their own
// pace: guess correctly, get the next one immediately. A shared timer ends
// the match for everyone at once; the live scoreboard is just each player's
// solved count, which is what makes the race visible ("who's ahead").
//
// Skip: stuck on a map? Press Skip. A map is skipped once more than half of the
// players agree (2/2, 2/3, 3/4, 3/5 ...); bots always agree. Skipping scores
// nothing — it just moves you on, and the answer is shown.
const BaseGame = require('../BaseGame');
const { shuffle } = require('../util');
const { normalize } = require('./spellthemost');
const { countriesForMode } = require('../data/countries');
const { availableCodes } = require('../geoMap');

const DURATION_MS = 90000;
const SEQUENCE_LENGTH = 40;
// Same country list and difficulty tiers as the Discord bot ('easy' | 'medium' | 'hard').
// 'medium' = famous + reasonably known countries; 'hard' = every country with a shape.
const MODE = 'medium';
const HAVE_SHAPE = availableCodes();
const COUNTRIES = countriesForMode(MODE).filter((c) => HAVE_SHAPE.has(c.code));

class GuessCountry extends BaseGame {
  constructor(env, opts) {
    super(env, opts);
    this.sequence = shuffle(this.env.rnd, COUNTRIES).slice(0, SEQUENCE_LENGTH);
    this.lookup = new Map();
    this.sequence.forEach((item, i) => {
      this.lookup.set(normalize(item.name), i);
      for (const al of item.aliases || []) this.lookup.set(normalize(al), i);
    });
    this.index = {};    // id -> which map they're on (position in the sequence)
    this.score = {};    // id -> how many they've solved (skips don't count)
    this.solvedAt = {}; // id -> ms of last correct guess
    this.skipVotes = new Map(); // position -> Set of human ids who want to skip it
    for (const p of this.players) { this.index[p.id] = 0; this.score[p.id] = 0; this.solvedAt[p.id] = 0; }
  }

  publicInit() {
    return { durationMs: DURATION_MS, total: this.sequence.length };
  }

  current(pid) { return this.sequence[this.index[pid]] || null; }

  begin() {
    if (this.state !== 'countdown') return;
    this.state = 'running';
    this.startedAt = this.env.now();
    this.env.emit('go', { serverTime: this.startedAt, endsAt: this.startedAt + DURATION_MS, total: this.sequence.length });
    for (const p of this.players) this.sendCurrent(p.id);
    this.timer = this.env.after(DURATION_MS, () => this.end());
    for (const b of this.bots) this.botPlay(b);
  }

  // `prev` = what just happened to the map they were on ({ name, how: 'correct' | 'skipped' }), so the UI can show the answer.
  sendCurrent(pid, prev = null) {
    const c = this.current(pid);
    const next = this.sequence[this.index[pid] + 1];
    // "code" is the ISO alpha-2 code; the frontend loads the themed globe from /api/maps/country/<code>.svg.
    // "next" lets the browser fetch the following map ahead of time so there is no wait after a correct guess.
    this.env.emitTo(pid, 'country', {
      index: this.index[pid], total: this.sequence.length, code: c ? c.code : null, next: next ? next.code : null,
      skip: c ? this.skipState(this.index[pid], pid) : null, prev,
    });
  }

  // Skip rule: a map is skipped once MORE THAN HALF of the players in the match agree (2 of 2, 2 of 3, 3 of 4, 3 of 5 ...).
  // A human who already moved past the map counts as agreeing. Bots always agree (once a human has asked), so against
  // bots a skip goes through straight away.
  skipState(pos, pid) {
    const active = this.players.filter((p) => !this.isForfeited(p.id));
    const humans = active.filter((p) => !p.isBot);
    const bots = active.length - humans.length;
    const votes = this.skipVotes.get(pos) || new Set();
    const humanHave = humans.filter((p) => votes.has(p.id) || this.index[p.id] > pos).length;
    const total = Math.max(1, active.length);
    return {
      pos, total, need: Math.floor(total / 2) + 1,
      have: humanHave + (humanHave > 0 ? bots : 0),
      voted: pid ? votes.has(pid) : false,
    };
  }

  checkSkips() {
    for (const [pos, votes] of [...this.skipVotes]) {
      const st = this.skipState(pos);
      if (st.have < st.need) continue;
      this.skipVotes.delete(pos);
      const name = this.sequence[pos].name;
      for (const p of this.humans) {
        if (this.isForfeited(p.id) || this.index[p.id] !== pos) continue;
        this.index[p.id]++;
        this.sendCurrent(p.id, { name, how: 'skipped' });
      }
    }
  }

  handle(pid, msg) {
    if (this.state !== 'running' || !msg || this.isForfeited(pid)) return;
    if (!(pid in this.index)) return;
    const want = this.current(pid);
    if (!want) return;

    if (msg.type === 'skip') {
      const player = this.players.find((p) => p.id === pid);
      if (!player || player.isBot) return;
      const pos = this.index[pid];
      if (!this.skipVotes.has(pos)) this.skipVotes.set(pos, new Set());
      this.skipVotes.get(pos).add(pid);
      this.env.emit('skipvote', { id: pid, ...this.skipState(pos) });
      this.checkSkips();
      return;
    }

    if (msg.type !== 'guess') return;
    const guessedIndex = this.lookup.get(normalize(msg.value));
    if (guessedIndex !== this.index[pid]) { this.env.emitTo(pid, 'reject', { value: String(msg.value ?? '').slice(0, 60) }); return; }
    this.index[pid]++;
    this.score[pid]++;
    this.solvedAt[pid] = this.env.now() - this.startedAt;
    this.env.emit('score', { id: pid, count: this.score[pid] });
    this.sendCurrent(pid, { name: want.name, how: 'correct' }); // code:null when they've run out; they wait for time to end
    this.checkSkips(); // someone waiting on this map may now be free to skip
  }

  // ── Bots ─────────────────────────────────────────────────────────────────
  botPlay(bot) {
    const rnd = this.env.rnd;
    const skill = Math.min(1, Math.max(0.2, (bot.rating - 700) / 1300)) * (bot.form || 1);
    const step = () => {
      if (this.state !== 'running' || this.isForfeited(bot.id)) return;
      const c = this.current(bot.id);
      if (!c) return;
      const know = rnd() < (0.35 + skill * 0.55);
      const thinkMs = know ? (1400 + rnd() * 2600) / (0.5 + skill) : (3000 + rnd() * 4000);
      this.env.after(thinkMs, () => {
        if (this.state !== 'running' || this.isForfeited(bot.id)) return;
        if (know) this.handle(bot.id, { type: 'guess', value: c.name });
        step(); // whether they got it or not, they keep trying (a miss just repeats/moves on next tick)
      });
    };
    step();
  }

  end() {
    if (this.state === 'ended') return;
    this.state = 'ended';
    this.env.cancel(this.timer);
    const entries = this.players.map((p) => ({ id: p.id, count: this.score[p.id], ms: this.solvedAt[p.id] }));
    const ranked = this.rank(entries, (a, b) => b.count - a.count || a.ms - b.ms);
    this.env.finish(ranked.map((r) => ({ id: r.id, rank: r.rank, score: r.count, detail: {} })));
  }

  snapshot() {
    return { total: this.sequence.length, index: this.index, score: this.score };
  }
}

GuessCountry.id = 'guesscountry';
GuessCountry.codes = COUNTRIES.map((c) => c.code); // used to pre-draw the maps when the server starts
module.exports = GuessCountry;
