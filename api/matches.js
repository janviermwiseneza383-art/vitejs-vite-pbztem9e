const h = (u) => ['https', '//' + u].join(':');
const API_KEY = '307db217fc72ae729796c2438a0448db';
const RW_LEAGUE = { id: 405, name: 'Rwanda Premier League', code: 'RW1' };

function sortLiveScore(list) {
  const rank = (s) => (['IN_PLAY', 'PAUSED'].includes(s) ? 0 : ['TIMED', 'SCHEDULED'].includes(s) ? 1 : 2);
  return [...list].sort((a, b) => rank(a.status) - rank(b.status));
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
    ],
    matches: [
      { id: 99091, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-23T13:00:00Z', venue: 'Umuganda Stadium', homeTeam: { id: 920, name: 'Etincelles FC', shortName: 'Etincelles' }, awayTeam: { id: 919, name: 'AS Kigali FC', shortName: 'AS Kigali' }, score: { fullTime: { home: 0, away: 2 } } },
      { id: 99092, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Gicumbi Stadium', homeTeam: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, awayTeam: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, score: { fullTime: { home: 2, away: 1 } } },
      { id: 99093, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Huye Stadium', homeTeam: { id: 904, name: 'Mukura VS', shortName: 'Mukura' }, awayTeam: { id: 921, name: 'Sunrise FC', shortName: 'Sunrise' }, score: { fullTime: { home: 4, away: 1 } } },
      { id: 99095, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-21T15:00:00Z', venue: 'Amahoro Stadium', homeTeam: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, awayTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, score: { fullTime: { home: 1, away: 1 } } },
    ],
  };
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    const hdrs = { 'x-apisports-key': API_KEY };
    const today = new Date().toISOString().slice(0, 10);
    if (code === 'RW1') { const rw = getRwandaData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches }); }
    const spMap = { BASKET: 'v1.basketball.api-sports.io/games?date=' + today, VOLLEY: 'v1.volleyball.api-sports.io/games?date=' + today, RUGBY: 'v1.rugby.api-sports.io/games?date=' + today, HANDBALL: 'v1.handball.api-sports.io/games?date=' + today, HOCKEY: 'v1.hockey.api-sports.io/games?date=' + today, NFL: 'v1.american-football.api-sports.io/games?date=' + today, BASEBALL: 'v1.baseball.api-sports.io/games?date=' + today, MMA: 'v1.mma.api-sports.io/fights?date=' + today, F1: 'v1.formula-1.api-sports.io/races?season=2026' };
    if (spMap[code]) {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: [] }] });
      const d = await fetch(h(spMap[code]), { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] }));
      const arr = (Array.isArray(d?.response) ? d.response : []).slice(0, 30).map((g, i) => ({ id: g.id || i + 70000, competition: { name: g.league?.name || code, code }, status: ['FT', 'AOT', 'AP'].includes(g.status?.short) ? 'FINISHED' : (g.status?.short === 'NS' ? 'TIMED' : 'IN_PLAY'), minute: g.status?.timer || g.status?.short || 'LIVE', utcDate: g.date || new Date().toISOString(), venue: g.country?.name || 'Arena', homeTeam: { id: 1, name: g.teams?.home?.name || 'Home', shortName: g.teams?.home?.name || 'Home', crest: g.teams?.home?.logo || '' }, awayTeam: { id: 2, name: g.teams?.away?.name || 'Away', shortName: g.teams?.away?.name || 'Away', crest: g.teams?.away?.logo || '' }, score: { fullTime: { home: (typeof g.scores?.home === 'object' ? g.scores?.home?.total : g.scores?.home) ?? null, away: (typeof g.scores?.away === 'object' ? g.scores?.away?.total : g.scores?.away) ?? null } } }));
      return res.status(200).json({ matches: sortLiveScore(arr) });
    }
    const from4 = new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10);
    const to7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    let apiUrl = h(`${host}/v4/matches?dateFrom=${from4}&dateTo=${to7}`);
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches?dateFrom=${from4}&dateTo=${to7}`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    const data = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } }).then((r) => r.json());
    if (!type) {
      const [fb, bk, vb] = await Promise.all([
        fetch(h('v3.football.api-sports.io/fixtures?live=all'), { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] })),
        fetch(h('v1.basketball.api-sports.io/games?date=' + today), { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] })),
        fetch(h('v1.volleyball.api-sports.io/games?date=' + today), { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] })),
      ]);
      const fbLive = (Array.isArray(fb?.response) ? fb.response : []).slice(0, 20).map((f) => ({ id: f.fixture?.id, competition: { name: '⚽ ' + (f.league?.name || 'Live'), code: 'LIVE' }, status: 'IN_PLAY', minute: f.fixture?.status?.elapsed || 'LIVE', utcDate: f.fixture?.date || new Date().toISOString(), venue: f.fixture?.venue?.name || 'Stadium', homeTeam: { id: 1, name: f.teams?.home?.name, shortName: f.teams?.home?.name, crest: f.teams?.home?.logo || '' }, awayTeam: { id: 2, name: f.teams?.away?.name, shortName: f.teams?.away?.name, crest: f.teams?.away?.logo || '' }, score: { fullTime: { home: f.goals?.home ?? 0, away: f.goals?.away ?? 0 } } }));
      const bkLive = (Array.isArray(bk?.response) ? bk.response : []).filter((g) => !['NS', 'PST', 'CANC', 'FT', 'AOT'].includes(g.status?.short || 'NS')).slice(0, 8).map((g, i) => ({ id: g.id || i + 81000, competition: { name: '🏀 ' + (g.league?.name || 'Basketball'), code: 'BASKET' }, status: 'IN_PLAY', minute: g.status?.timer || g.status?.short || 'LIVE', utcDate: g.date || new Date().toISOString(), venue: 'Arena', homeTeam: { id: 1, name: g.teams?.home?.name, shortName: g.teams?.home?.name, crest: g.teams?.home?.logo || '' }, awayTeam: { id: 2, name: g.teams?.away?.name, shortName: g.teams?.away?.name, crest: g.teams?.away?.logo || '' }, score: { fullTime: { home: g.scores?.home?.total ?? 0, away: g.scores?.away?.total ?? 0 } } }));
      const vbLive = (Array.isArray(vb?.response) ? vb.response : []).filter((g) => !['NS', 'PST', 'CANC', 'FT'].includes(g.status?.short || 'NS')).slice(0, 8).map((g, i) => ({ id: g.id || i + 82000, competition: { name: '🏐 ' + (g.league?.name || 'Volleyball'), code: 'VOLLEY' }, status: 'IN_PLAY', minute: g.status?.short || 'LIVE', utcDate: g.date || new Date().toISOString(), venue: 'Arena', homeTeam: { id: 1, name: g.teams?.home?.name, shortName: g.teams?.home?.name, crest: g.teams?.home?.logo || '' }, awayTeam: { id: 2, name: g.teams?.away?.name, shortName: g.teams?.away?.name, crest: g.teams?.away?.logo || '' }, score: { fullTime: { home: g.scores?.home ?? 0, away: g.scores?.away ?? 0 } } }));
      const baseMatches = Array.isArray(data.matches) ? data.matches : [];
      return res.status(200).json({ matches: sortLiveScore([...fbLive, ...bkLive, ...vbLive, ...getRwandaData().matches, ...baseMatches]) });
    }
    return res.status(200).json(data);
  } catch (e) { return res.status(200).json({ matches: getRwandaData().matches, error: e.message }); }
}
