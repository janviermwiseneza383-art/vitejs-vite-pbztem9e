const h = (u) => ['https', '//' + u].join(':');
const API_KEY = '307db217fc72ae729796c2438a0448db';
const RW_LEAGUE = { id: 405, name: 'Rwanda Premier League', code: 'RW1' };
const UEL_LEAGUE = { id: 9998, name: 'UEFA Europa League', code: 'UEL' };

function sortLiveScore(list) {
  const rank = (s) => (['IN_PLAY', 'PAUSED'].includes(s) ? 0 : ['TIMED', 'SCHEDULED'].includes(s) ? 1 : 2);
  return [...list].sort((a, b) => {
    const r = rank(a.status) - rank(b.status);
    if (r !== 0) return r;
    const ta = new Date(a.utcDate).getTime();
    const tb = new Date(b.utcDate).getTime();
    return a.status === 'FINISHED' ? tb - ta : ta - tb;
  });
}

async function getRwandaFootball() {
  const hdrs = { 'x-apisports-key': API_KEY };
  const base = h('v3.football.api-sports.io');
  for (const season of) {
    try {
      const [fixRes, tblRes] = await Promise.all([
        fetch(`${base}/fixtures?league=405&season=${season}`, { headers: hdrs }).then((r) => r.json()).catch(() => ({})),
        fetch(`${base}/standings?league=405&season=${season}`, { headers: hdrs }).then((r) => r.json()).catch(() => ({})),
      ]);
      if (Array.isArray(fixRes?.response) && fixRes.response.length > 0) {
        const matches = fixRes.response.map((f) => {
          const st = f.fixture?.status?.short || 'NS';
          const live = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'].includes(st);
          const fin = ['FT', 'AET', 'PEN'].includes(st);
          return {
            id: f.fixture?.id, competition: RW_LEAGUE, status: live ? 'IN_PLAY' : fin ? 'FINISHED' : 'TIMED',
            minute: f.fixture?.status?.elapsed, injuryTime: f.fixture?.status?.extra || null, utcDate: f.fixture?.date, venue: f.fixture?.venue?.name || 'Rwanda',
            homeTeam: { id: f.teams?.home?.id, name: f.teams?.home?.name, shortName: f.teams?.home?.name, crest: f.teams?.home?.logo || '' },
            awayTeam: { id: f.teams?.away?.id, name: f.teams?.away?.name, shortName: f.teams?.away?.name, crest: f.teams?.away?.logo || '' },
            score: { duration: st === 'PEN' ? 'PENALTY_SHOOTOUT' : 'REGULAR', fullTime: { home: f.goals?.home, away: f.goals?.away }, penalties: st === 'PEN' ? { home: f.score?.penalty?.home, away: f.score?.penalty?.away } : null },
          };
        });
        const rawTbl = tblRes?.response?.at(0)?.league?.standings?.at(0) || [];
        const table = rawTbl.map((r) => ({ position: r.rank, team: { id: r.team?.id, name: r.team?.name, shortName: r.team?.name, crest: r.team?.logo || '' }, playedGames: r.all?.played || 0, goalDifference: r.goalsDiff || 0, points: r.points || 0 }));
        return { matches: sortLiveScore(matches), table };
      }
    } catch {}
  }
  return { matches: [], table: [] };
}

async function getOtherSport(sportCode) {
  const hdrs = { 'x-apisports-key': API_KEY };
  const today = new Date().toISOString().slice(0, 10);
  const map = {
    BASKET: { url: h(`v1.basketball.api-sports.io/games?date=${today}`), label: 'Basketball / NBA' },
    VOLLEY: { url: h(`v1.volleyball.api-sports.io/games?date=${today}`), label: 'Volleyball World' },
    RUGBY: { url: h(`v1.rugby.api-sports.io/games?date=${today}`), label: 'Rugby Union' },
    HANDBALL: { url: h(`v1.handball.api-sports.io/games?date=${today}`), label: 'Handball' },
    HOCKEY: { url: h(`v1.hockey.api-sports.io/games?date=${today}`), label: 'Ice Hockey' },
    NFL: { url: h(`v1.american-football.api-sports.io/games?date=${today}`), label: 'NFL Football' },
    BASEBALL: { url: h(`v1.baseball.api-sports.io/games?date=${today}`), label: 'MLB Baseball' },
    MMA: { url: h(`v1.mma.api-sports.io/fights?date=${today}`), label: 'UFC / MMA' },
    F1: { url: h(`v1.formula-1.api-sports.io/races?season=2026`), label: 'Formula 1' },
  };
  const cfg = map[sportCode];
  if (!cfg) return [];
  try {
    const d = await fetch(cfg.url, { headers: hdrs }).then((r) => r.json());
    const arr = Array.isArray(d?.response) ? d.response : [];
    return arr.slice(0, 25).map((g, i) => {
      if (sportCode === 'F1') {
        return { id: g.id || i + 50000, competition: { name: g.competition?.name || 'Formula 1', code: 'F1' }, status: g.status === 'Completed' ? 'FINISHED' : 'TIMED', utcDate: g.date || new Date().toISOString(), venue: g.circuit?.name || 'Circuit', homeTeam: { id: 1, name: g.competition?.location?.country || 'Grand Prix', shortName: g.competition?.location?.country || 'GP' }, awayTeam: { id: 2, name: g.type || 'Race', shortName: g.type || 'Race' }, score: { fullTime: { home: null, away: null } } };
      }
      if (sportCode === 'MMA') {
        const f1 = g.fighters?.first, f2 = g.fighters?.second;
        return { id: g.id || i + 60000, competition: { name: g.slug || 'UFC / MMA', code: 'MMA' }, status: g.status?.short === 'FT' ? 'FINISHED' : 'TIMED', utcDate: g.date || new Date().toISOString(), venue: 'Octagon', homeTeam: { id: f1?.id || 1, name: f1?.name || 'Fighter 1', shortName: f1?.name || 'Fighter 1', crest: f1?.logo || '' }, awayTeam: { id: f2?.id || 2, name: f2?.name || 'Fighter 2', shortName: f2?.name || 'Fighter 2', crest: f2?.logo || '' }, score: { fullTime: { home: f1?.winner ? 1 : null, away: f2?.winner ? 1 : null } } };
      }
      const st = g.status?.short || 'NS';
      const fin = ['FT', 'AOT', 'AP'].includes(st);
      const live = !fin && st !== 'NS' && st !== 'PST' && st !== 'CANC';
      const hs = typeof g.scores?.home === 'object' ? g.scores?.home?.total : g.scores?.home;
      const as = typeof g.scores?.away === 'object' ? g.scores?.away?.total : g.scores?.away;
      return {
        id: g.id || i + 70000, competition: { name: g.league?.name || cfg.label, code: sportCode },
        status: live ? 'IN_PLAY' : fin ? 'FINISHED' : 'TIMED', minute: g.status?.timer || st, utcDate: g.date || new Date().toISOString(), venue: g.country?.name || 'Arena',
        homeTeam: { id: g.teams?.home?.id || 1, name: g.teams?.home?.name, shortName: g.teams?.home?.name, crest: g.teams?.home?.logo || '' },
        awayTeam: { id: g.teams?.away?.id || 2, name: g.teams?.away?.name, shortName: g.teams?.away?.name, crest: g.teams?.away?.logo || '' },
        score: { fullTime: { home: hs ?? null, away: as ?? null } },
      };
    });
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    if (code === 'RW1') {
      const rw = await getRwandaFootball();
      return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches });
    }
    if (['BASKET', 'VOLLEY', 'RUGBY', 'HANDBALL', 'HOCKEY', 'NFL', 'BASEBALL', 'MMA', 'F1'].includes(code)) {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: [] }] });
      const list = await getOtherSport(code);
      return res.status(200).json({ matches: sortLiveScore(list) });
    }

    const now = new Date();
    const from4 = new Date(now.getTime() - 4 * 86400000).toISOString().slice(0, 10);
    const to7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

    let apiUrl = '';
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches?dateFrom=${from4}&dateTo=${to7}`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    else apiUrl = h(`${host}/v4/matches?dateFrom=${from4}&dateTo=${to7}`);

    const data = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } }).then((r) => r.json());
    if (Array.isArray(data.matches)) {
      const merged = !type ? [...(await getRwandaFootball()).matches.slice(0, 12), ...data.matches] : data.matches;
      data.matches = sortLiveScore(merged);
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
