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

function getRwanda2026Data() {
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
      { position: 13, team: { id: 914, name: 'Amagaju FC', shortName: 'Amagaju' }, playedGames: 8, goalDifference: -2, points: 9 },
      { position: 14, team: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, playedGames: 8, goalDifference: -3, points: 8 },
      { position: 15, team: { id: 919, name: 'AS Kigali', shortName: 'AS Kigali' }, playedGames: 8, goalDifference: -4, points: 7 },
      { position: 16, team: { id: 916, name: "Etoile de l'Est", shortName: "Etoile de l'Est" }, playedGames: 8, goalDifference: -6, points: 5 },
    ],
    matches: [
      { id: 99091, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-23T13:00:00Z', venue: 'Umuganda Stadium', homeTeam: { id: 920, name: 'Etincelles FC', shortName: 'Etincelles' }, awayTeam: { id: 919, name: 'AS Kigali FC', shortName: 'AS Kigali' }, score: { fullTime: { home: 0, away: 2 } } },
      { id: 99092, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Gicumbi Stadium', homeTeam: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, awayTeam: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, score: { fullTime: { home: 2, away: 1 } } },
      { id: 99093, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Huye Stadium', homeTeam: { id: 904, name: 'Mukura Victory Sport', shortName: 'Mukura' }, awayTeam: { id: 921, name: 'Sunrise FC', shortName: 'Sunrise' }, score: { fullTime: { home: 4, away: 1 } } },
      { id: 99094, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-22T13:00:00Z', venue: 'Kigali Pelé Stadium', homeTeam: { id: 918, name: 'El Merreikh SC Omdurman', shortName: 'Al-Merrikh' }, awayTeam: { id: 917, name: 'Gorilla FC', shortName: 'Gorilla' }, score: { fullTime: { home: 1, away: 1 } } },
      { id: 99095, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-21T15:00:00Z', venue: 'Amahoro National Stadium', homeTeam: { id: 902, name: 'Rayon Sports FC', shortName: 'Rayon Sports' }, awayTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, score: { fullTime: { home: 1, away: 1 } } },
      { id: 99096, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-20T13:00:00Z', venue: 'Ngoma Stadium', homeTeam: { id: 916, name: "Etoile de l'Est FC", shortName: "Etoile de l'Est" }, awayTeam: { id: 913, name: 'Bugesera FC', shortName: 'Bugesera' }, score: { fullTime: { home: 0, away: 3 } } },
      { id: 99097, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-20T13:00:00Z', venue: 'Nyamagabe Stadium', homeTeam: { id: 914, name: 'Amagaju FC', shortName: 'Amagaju' }, awayTeam: { id: 910, name: 'Marine FC', shortName: 'Marines' }, score: { fullTime: { home: 0, away: 0 } } },
      { id: 99098, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-20T13:00:00Z', venue: 'Kigali Pelé Stadium', homeTeam: { id: 907, name: 'Gasogi United FC', shortName: 'Gasogi United' }, awayTeam: { id: 905, name: 'Kiyovu SA', shortName: 'Kiyovu Sports' }, score: { fullTime: { home: 1, away: 4 } } },
      { id: 99099, competition: RW_LEAGUE, status: 'FINISHED', utcDate: '2026-11-20T16:00:00Z', venue: 'Kigali Pelé Stadium', homeTeam: { id: 903, name: 'Police FC', shortName: 'Police' }, awayTeam: { id: 911, name: 'Al Hilal SC Omdurman', shortName: 'Al-Hilal' }, score: { fullTime: { home: 0, away: 1 } } },
    ],
  };
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
    return arr.slice(0, 30).map((g, i) => {
      if (sportCode === 'F1') return { id: g.id || i + 50000, competition: { name: g.competition?.name || 'Formula 1', code: 'F1' }, status: g.status === 'Completed' ? 'FINISHED' : 'TIMED', utcDate: g.date || new Date().toISOString(), venue: g.circuit?.name || 'Circuit', homeTeam: { id: 1, name: g.competition?.location?.country || 'Grand Prix', shortName: g.competition?.location?.country || 'GP' }, awayTeam: { id: 2, name: g.type || 'Race', shortName: g.type || 'Race' }, score: { fullTime: { home: null, away: null } } };
      if (sportCode === 'MMA') { const f1 = g.fighters?.first, f2 = g.fighters?.second; return { id: g.id || i + 60000, competition: { name: g.slug || 'UFC / MMA', code: 'MMA' }, status: g.status?.short === 'FT' ? 'FINISHED' : 'TIMED', utcDate: g.date || new Date().toISOString(), venue: 'Octagon', homeTeam: { id: f1?.id || 1, name: f1?.name || 'Fighter 1', shortName: f1?.name || 'Fighter 1', crest: f1?.logo || '' }, awayTeam: { id: f2?.id || 2, name: f2?.name || 'Fighter 2', shortName: f2?.name || 'Fighter 2', crest: f2?.logo || '' }, score: { fullTime: { home: f1?.winner ? 1 : null, away: f2?.winner ? 1 : null } } }; }
      const st = g.status?.short || 'NS';
      const fin = ['FT', 'AOT', 'AP'].includes(st);
      const live = !fin && st !== 'NS' && st !== 'PST' && st !== 'CANC';
      const hs = typeof g.scores?.home === 'object' ? g.scores?.home?.total : g.scores?.home;
      const as = typeof g.scores?.away === 'object' ? g.scores?.away?.total : g.scores?.away;
      return { id: g.id || i + 70000, competition: { name: g.league?.name || cfg.label, code: sportCode }, status: live ? 'IN_PLAY' : fin ? 'FINISHED' : 'TIMED', minute: g.status?.timer || st, utcDate: g.date || new Date().toISOString(), venue: g.country?.name || 'Arena', homeTeam: { id: g.teams?.home?.id || 1, name: g.teams?.home?.name, shortName: g.teams?.home?.name, crest: g.teams?.home?.logo || '' }, awayTeam: { id: g.teams?.away?.id || 2, name: g.teams?.away?.name, shortName: g.teams?.away?.name, crest: g.teams?.away?.logo || '' }, score: { fullTime: { home: hs ?? null, away: as ?? null } } };
    });
  } catch { return []; }
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    if (code === 'RW1') { const rw = getRwanda2026Data(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: sortLiveScore(rw.matches) }); }
    if (['BASKET', 'VOLLEY', 'RUGBY', 'HANDBALL', 'HOCKEY', 'NFL', 'BASEBALL', 'MMA', 'F1'].includes(code)) {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: [] }] });
      return res.status(200).json({ matches: sortLiveScore(await getOtherSport(code)) });
    }
    const now = new Date();
    const from4 = new Date(now.getTime() - 4 * 86400000).toISOString().slice(0, 10);
    const to7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    let apiUrl = '';
