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

async function getLiveWorld() {
  try {
    const r = await fetch(h('v3.football.api-sports.io/fixtures?live=all'), { headers: { 'x-apisports-key': API_KEY } });
    const d = await r.json();
    if (!Array.isArray(d?.response)) return [];
    return d.response.slice(0, 25).map((f) => ({
      id: f.fixture?.id, competition: { name: `${f.league?.country || ''} • ${f.league?.name || 'Live'}`, code: 'LIVE' },
      status: 'IN_PLAY', minute: f.fixture?.status?.elapsed || 'LIVE', utcDate: f.fixture?.date || new Date().toISOString(), venue: f.fixture?.venue?.name || 'Stadium',
      homeTeam: { id: f.teams?.home?.id, name: f.teams?.home?.name, shortName: f.teams?.home?.name, crest: f.teams?.home?.logo || '' },
      awayTeam: { id: f.teams?.away?.id, name: f.teams?.away?.name, shortName: f.teams?.away?.name, crest: f.teams?.away?.logo || '' },
      score: { fullTime: { home: f.goals?.home ?? 0, away: f.goals?.away ?? 0 } },
    }));
  } catch { return []; }
}

async function getMatchExtras(fixtureId, homeName, dateStr) {
  const hdrs = { 'x-apisports-key': API_KEY };
  const base = h('v3.football.api-sports.io');
  let targetId = fixtureId;
  try {
    if (homeName && dateStr) {
      const day = dateStr.slice(0, 10);
      const sr = await fetch(`${base}/fixtures?date=${day}`, { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] }));
      const key = homeName.toLowerCase().split(' ').at(0);
      const found = (Array.isArray(sr?.response) ? sr.response : []).find((x) => x.teams?.home?.name?.toLowerCase().includes(key) || x.teams?.away?.name?.toLowerCase().includes(key));
      if (found?.fixture?.id) targetId = found.fixture.id;
    }
    const [evRes, lnRes] = await Promise.all([
      fetch(`${base}/fixtures/events?fixture=${targetId}`, { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] })),
      fetch(`${base}/fixtures/lineups?fixture=${targetId}`, { headers: hdrs }).then((r) => r.json()).catch(() => ({ response: [] })),
    ]);
    const goals = (Array.isArray(evRes?.response) ? evRes.response : []).filter((e) => e.type === 'Goal').map((g) => ({ minute: g.time?.elapsed, scorer: { name: g.player?.name }, team: { name: g.team?.name } }));
    const lns = Array.isArray(lnRes?.response) ? lnRes.response : [];
    const hLine = (lns.at(0)?.startXI || []).map((p) => ({ shirtNumber: p.player?.number, name: p.player?.name }));
    const aLine = (lns.at(1)?.startXI || []).map((p) => ({ shirtNumber: p.player?.number, name: p.player?.name }));
    return { goals, homeTeam: { lineup: hLine }, awayTeam: { lineup: aLine } };
  } catch { return { goals: [], homeTeam: { lineup: [] }, awayTeam: { lineup: [] } }; }
}

export default async function handler(req, res) {
  try {
    const { type, id, code, home, date } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    if (code === 'RW1') { const rw = getRwandaData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches }); }
    if (type === 'extras') return res.status(200).json(await getMatchExtras(id, home, date));

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
