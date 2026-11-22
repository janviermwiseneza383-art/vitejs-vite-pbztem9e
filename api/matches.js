const h = (u) => ['https', '//' + u].join(':');
const RW_LEAGUE = { id: 9999, name: 'Rwanda Premier League', code: 'RW1' };
const UEL_LEAGUE = { id: 9998, name: 'UEFA Europa League', code: 'UEL' };

function getRwandaData() {
  const today = new Date().toISOString().slice(0, 10);
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const tom = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  return {
    table: [
      { position: 1, team: { id: 910, name: 'Marines FC', shortName: 'Marines' }, playedGames: 9, won: 4, draw: 3, lost: 2, goalDifference: 7, points: 15 },
      { position: 2, team: { id: 905, name: 'Kiyovu Sports', shortName: 'Kiyovu Sports' }, playedGames: 7, won: 4, draw: 1, lost: 2, goalDifference: 5, points: 13 },
      { position: 3, team: { id: 911, name: 'Al-Hilal', shortName: 'Al-Hilal' }, playedGames: 6, won: 4, draw: 1, lost: 1, goalDifference: 3, points: 13 },
      { position: 4, team: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, playedGames: 7, won: 4, draw: 1, lost: 2, goalDifference: 2, points: 13 },
      { position: 5, team: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, playedGames: 8, won: 3, draw: 3, lost: 2, goalDifference: 3, points: 12 },
      { position: 6, team: { id: 901, name: 'APR FC', shortName: 'APR FC' }, playedGames: 7, won: 3, draw: 3, lost: 1, goalDifference: 4, points: 12 },
      { position: 7, team: { id: 913, name: 'Bugesera FC', shortName: 'Bugesera' }, playedGames: 8, won: 3, draw: 2, lost: 3, goalDifference: 1, points: 11 },
      { position: 8, team: { id: 903, name: 'Police FC', shortName: 'Police' }, playedGames: 8, won: 3, draw: 2, lost: 3, goalDifference: 0, points: 11 },
      { position: 9, team: { id: 907, name: 'Gasogi United', shortName: 'Gasogi United' }, playedGames: 8, won: 2, draw: 3, lost: 3, goalDifference: -2, points: 9 },
      { position: 10, team: { id: 914, name: 'Amagaju FC', shortName: 'Amagaju' }, playedGames: 8, won: 2, draw: 3, lost: 3, goalDifference: -2, points: 9 },
      { position: 11, team: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, playedGames: 8, won: 2, draw: 2, lost: 4, goalDifference: -3, points: 8 },
      { position: 12, team: { id: 916, name: "Etoile de l'Est", shortName: "Etoile de l'Est" }, playedGames: 8, won: 1, draw: 2, lost: 5, goalDifference: -6, points: 5 },
    ],
    matches: [
      { id: 99201, competition: RW_LEAGUE, status: 'TIMED', utcDate: `${today}T15:00:00Z`, venue: 'Amahoro National Stadium', homeTeam: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, awayTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, score: { fullTime: { home: null, away: null } } },
      { id: 99202, competition: RW_LEAGUE, status: 'FINISHED', utcDate: `${yest}T13:00:00Z`, venue: 'Kigali Pelé Stadium', homeTeam: { id: 903, name: 'Police FC', shortName: 'Police' }, awayTeam: { id: 911, name: 'Al-Hilal', shortName: 'Al-Hilal' }, score: { fullTime: { home: 0, away: 1 } } },
      { id: 99203, competition: RW_LEAGUE, status: 'FINISHED', utcDate: `${yest}T13:00:00Z`, venue: 'Nyamagabe Stadium', homeTeam: { id: 914, name: 'Amagaju FC', shortName: 'Amagaju' }, awayTeam: { id: 910, name: 'Marines FC', shortName: 'Marines' }, score: { fullTime: { home: 0, away: 0 } } },
      { id: 99204, competition: RW_LEAGUE, status: 'TIMED', utcDate: `${tom}T13:00:00Z`, venue: 'Gicumbi Stadium', homeTeam: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, awayTeam: { id: 915, name: 'Musanze FC', shortName: 'Musanze' }, score: { fullTime: { home: null, away: null } } },
    ],
  };
}

function getUelData() {
  const base = h('crests.football-data.org/');
  const teams = [
    { id: 66, name: 'Manchester United', shortName: 'Man United', crest: `${base}66.png` },
    { id: 73, name: 'Tottenham Hotspur', shortName: 'Tottenham', crest: `${base}73.png` },
    { id: 100, name: 'AS Roma', shortName: 'Roma', crest: `${base}100.png` },
    { id: 77, name: 'Athletic Club', shortName: 'Athletic', crest: `${base}77.png` },
  ];
  const d = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  return {
    table: teams.map((tm, i) => ({ position: i + 1, team: tm, playedGames: 4, goalDifference: 6 - i, points: 12 - i * 2 })),
    matches: [
      { id: 88001, competition: UEL_LEAGUE, status: 'TIMED', utcDate: `${d}T20:00:00Z`, venue: 'Old Trafford', homeTeam: teams.at(0), awayTeam: teams.at(2), score: { fullTime: { home: null, away: null } } },
      { id: 88002, competition: UEL_LEAGUE, status: 'TIMED', utcDate: `${d}T20:00:00Z`, venue: 'Tottenham Hotspur Stadium', homeTeam: teams.at(1), awayTeam: teams.at(3), score: { fullTime: { home: null, away: null } } },
    ],
  };
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    if (code === 'RW1') { const rw = getRwandaData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches }); }
    if (code === 'UEL') { const uel = getUelData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: uel.table }] } : { matches: uel.matches }); }

    let apiUrl = '';
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    else {
      const now = new Date();
      const from = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
      const to = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10);
      apiUrl = h(`${host}/v4/matches?dateFrom=${from}&dateTo=${to}`);
    }

    const data = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } }).then((r) => r.json());
    if (!type && Array.isArray(data.matches)) data.matches = [...getRwandaData().matches, ...data.matches];
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
