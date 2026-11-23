const h = (u) => ['https', '//' + u].join(':');
const API_KEY = '307db217fc72ae729796c2438a0448db';
const RW_LEAGUE = { id: 405, name: 'Rwanda Premier League', code: 'RW1' };

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

function getRwandaData() {
  return {
    table: [
      { position: 1, team: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, playedGames: 8, goalDifference: 3, points: 16 },
      { position: 2, team: { id: 910, name: 'Marines FC', shortName: 'Marines' }, playedGames: 9, goalDifference: 7, points: 15 },
      { position: 3, team: { id: 904, name: 'Mukura VS', shortName: 'Mukura' }, playedGames: 8, goalDifference: 6, points: 15 },
      { position: 4, team: { id: 905, name: 'Kiyovu Sports', shortName: 'Kiyovu Sports' }, playedGames: 7, goalDifference: 5, points: 13 },
      { position: 5, team: { id: 911, name: 'Al-Hilal', shortName: 'Al-Hilal' }, playedGames: 6, goalDifference: 3, points: 13 },
      { position: 6, team: { id: 917, name: 'Gorilla FC', shortName: 'Gorilla' }, playedGames: 9, goalDifference: 1, points: 13 },
      { position: 7, team: { id: 913, name: 'Bugesera FC', shortName: 'Bugesera' }, playedGames: 7, goalDifference: 5, points: 12 },
      { position: 8, team: { id: 918, name: 'Al-Merrikh', shortName: 'Al-Merrikh' }, playedGames: 6, goalDifference: 4, points: 10 },
      { position: 9, team: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, playedGames: 8, goalDifference: 1, points: 10 },
      { position: 10, team: { id: 901, name: 'APR FC', shortName: 'APR FC' }, playedGames: 7, goalDifference: 2, points: 10 },
      { position: 11, team: { id: 903, name: 'Police FC', shortName: 'Police' }, playedGames: 8, goalDifference: 0, points: 9 },
      { position: 12, team: { id: 907, name: 'Gasogi United', shortName: 'Gasogi United' }, playedGames: 8, goalDifference: -2, points: 9 },
    ],
    matches: [
      { id: 99091, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-23T13:00:00Z', venue: 'Umuganda Stadium', homeTeam: { id: 920, name: 'Etincelles FC', shortName: 'Etincelles' }, awayTeam: { id: 919, name: 'AS Kigali FC', shortName: 'AS Kigali' }, score: { fullTime: { home: 0, away: 2 } } },
      { id: 99092, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Gicumbi Stadium', homeTeam: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, awayTeam: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, score: { fullTime: { home: 2, away: 1 } } },
      { id: 99093, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Huye Stadium', homeTeam: { id: 904, name: 'Mukura VS', shortName: 'Mukura' }, awayTeam: { id: 921, name: 'Sunrise FC', shortName: 'Sunrise' }, score: { fullTime: { home: 4, away: 1 } } },
      { id: 99095, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-21T15:00:00Z', venue: 'Amahoro Stadium', homeTeam: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, awayTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, score: { fullTime: { home: 1, away: 1 } } },
    ],
  };
}

async function getLiveWorld() {
  try {
    const d = await fetch(h('v3.football.api-sports.io/fixtures?live=all'), { headers: { 'x-apisports-key': API_KEY } }).then((r) => r.json());
    if (!Array.isArray(d?.response)) return [];
    return d.response.slice(0, 30).map((f) => ({
      id: f.fixture?.id, competition: { name: `${f.league?.country || ''} • ${f.league?.name || 'Live'}`, code: 'LIVE' },
      status: 'IN_PLAY', minute: f.fixture?.status?.elapsed || 'LIVE', utcDate: f.fixture?.date || new Date().toISOString(), venue: f.fixture?.venue?.name || 'Stadium',
      homeTeam: { id: f.teams?.home?.id, name: f.teams?.home?.name, shortName: f.teams?.home?.name, crest: f.teams?.home?.logo || '' },
      awayTeam: { id: f.teams?.away?.id, name: f.teams?.away?.name, shortName: f.teams?.away?.name, crest: f.teams?.away?.logo || '' },
      score: { fullTime: { home: f.goals?.home ?? 0, away: f.goals?.away ?? 0 } },
    }));
  } catch { return []; }
}

async function getOtherSport(sportCode) {
  const hdrs = { 'x-apisports-key': API_KEY };
  const today = new Date().toISOString().slice(0, 10);
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const endpoints = {
    BASKET: [`v1.basketball.api-sports.io/games?date=${today}`, `v1.basketball.api-sports.io/games?date=${yest}`],
    VOLLEY: [`v1.volleyball.api-sports.io/games?date=${today}`, `v1.volleyball.api-sports.io/games?date=${yest}`],
    RUGBY: [`v1.rugby.api-sports.io/games?date=${today}`, `v1.rugby.api-sports.io/games?date=${yest}`],
    HANDBALL: [`v1.handball.api-sports.io/games?date=${today}`, `v1.handball.api-sports.io/games?date=${yest}`],
    HOCKEY: [`v1.hockey.api-sports.io/games?date=${today}`, `v1.hockey.api-sports.io/games?date=${yest}`],
    NFL: [`v1.american-football.api-sports.io/games?date=${today}`, `v1.american-football.api-sports.io/games?date=${yest}`],
    BASEBALL: [`v1.baseball.api-sports.io/games?date=${today}`, `v1.baseball.api-sports.io/games?date=${yest}`],
    MMA: [`v1.mma.api-sports.io/fights?date=${today}`, `v1.mma.api-sports.io/fights?date=${yest}`],
    F1: ['v1.formula-1.api-sports.io/races?season=2026'],
  };
  const urls = endpoints[sportCode];
  if (!urls) return [];
  try {
    const results = await Promise.all(urls.map((u) => fetch(h(u), { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] }))));
    const raw = results.flatMap((d) => (Array.isArray(d?.response) ? d.response : []));
    return raw.slice(0, 40).map((g, i) => {
      const st = g.status?.short || 'NS';
      const fin = ['FT', 'AOT', 'AP'].includes(st) || g.status === 'Completed';
      const live = !fin && st !== 'NS' && st !== 'PST' && st !== 'CANC' && g.status !== 'Scheduled';
      const hs = typeof g.scores?.home === 'object' ? g.scores?.home?.total : g.scores?.home;
      const as = typeof g.scores?.away === 'object' ? g.scores?.away?.total : g.scores?.away;
      return {
        id: g.id || i + 70000,
        competition: { name: g.league?.name || g.competition?.name || sportCode, code: sportCode },
        status: live ? 'IN_PLAY' : fin ? 'FINISHED' : 'TIMED',
        minute: g.status?.timer || st,
        utcDate: g.date || new Date().toISOString(),
        venue: g.country?.name || g.circuit?.name || 'Arena',
        homeTeam: { id: 1, name: g.teams?.home?.name || g.fighters?.first?.name || g.competition?.location?.country || 'Home', shortName: g.teams?.home?.name || g.fighters?.first?.name || 'Home', crest: g.teams?.home?.logo || g.fighters?.first?.logo || '' },
        awayTeam: { id: 2, name: g.teams?.away?.name || g.fighters?.second?.name || g.type || 'Away', shortName: g.teams?.away?.name || g.fighters?.second?.name || 'Away', crest: g.teams?.away?.logo || g.fighters?.second?.logo || '' },
        score: { fullTime: { home: hs ?? null, away: as ?? null } },
      };
    });
  } catch { return []; }
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    if (code === 'RW1') { const rw = getRwandaData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches }); }
    if (['BASKET', 'VOLLEY', 'RUGBY', 'HANDBALL', 'HOCKEY', 'NFL', 'BASEBALL', 'MMA', 'F1'].includes(code)) {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: [] }] });
      return res.status(200).json({ matches: sortLiveScore(await getOtherSport(code)) });
    }
    const now = new Date();
    const from4 = new Date(now.getTime() - 4 * 86400000).toISOString().slice(0, 10);
    const to7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    let apiUrl = h(`${host}/v4/matches?dateFrom=${from4}&dateTo=${to7}`);
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches?dateFrom=${from4}&dateTo=${to7}`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    const data = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } }).then((r) => r.json());
    if (!type) {
      const live = await getLiveWorld();
      const baseMatches = Array.isArray(data.matches) ? data.matches : [];
      return res.status(200).json({ matches: sortLiveScore([...live, ...getRwandaData().matches, ...baseMatches]) });
    }
    return res.status(200).json(data);
  } catch (e) { return res.status(200).json({ matches: getRwandaData().matches, error: e.message }); }
}
