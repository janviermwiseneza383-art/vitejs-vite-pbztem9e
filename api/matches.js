const RWANDA_LEAGUE = {
  id: 9999,
  name: 'Rwanda Premier League',
  code: 'RW1',
  emblem: 'https://football-data.org',
};

const RWANDA_TABLE = [
  { position: 1, team: { id: 901, name: 'APR FC', shortName: 'APR FC', crest: '' }, playedGames: 10, won: 8, draw: 2, lost: 0, goalDifference: 14, points: 26 },
  { position: 2, team: { id: 902, name: 'Rayon Sports FC', shortName: 'Rayon Sports', crest: '' }, playedGames: 10, won: 7, draw: 2, lost: 1, goalDifference: 11, points: 23 },
  { position: 3, team: { id: 903, name: 'Police FC Rwanda', shortName: 'Police FC', crest: '' }, playedGames: 10, won: 6, draw: 2, lost: 2, goalDifference: 7, points: 20 },
  { position: 4, team: { id: 904, name: 'Mukura VS', shortName: 'Mukura VS', crest: '' }, playedGames: 10, won: 5, draw: 3, lost: 2, goalDifference: 5, points: 18 },
  { position: 5, team: { id: 905, name: 'SC Kiyovu', shortName: 'Kiyovu Sports', crest: '' }, playedGames: 10, won: 4, draw: 3, lost: 3, goalDifference: 2, points: 15 },
  { position: 6, team: { id: 906, name: 'AS Kigali', shortName: 'AS Kigali', crest: '' }, playedGames: 10, won: 4, draw: 2, lost: 4, goalDifference: 0, points: 14 },
  { position: 7, team: { id: 907, name: 'Gasogi United', shortName: 'Gasogi Utd', crest: '' }, playedGames: 10, won: 3, draw: 3, lost: 4, goalDifference: -2, points: 12 },
  { position: 8, team: { id: 908, name: 'Etincelles FC', shortName: 'Etincelles', crest: '' }, playedGames: 10, won: 2, draw: 2, lost: 6, goalDifference: -8, points: 8 },
];

function getRwandaMatches() {
  const d1 = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const d2 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  return [
    { id: 99001, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d1}T13:00:00Z`, venue: 'Kigali Pelé Stadium', homeTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, awayTeam: { id: 903, name: 'Police FC', shortName: 'Police FC' }, score: { fullTime: { home: null, away: null } } },
    { id: 99002, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d1}T16:00:00Z`, venue: 'Amahoro National Stadium', homeTeam: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, awayTeam: { id: 905, name: 'Kiyovu Sports', shortName: 'Kiyovu Sports' }, score: { fullTime: { home: null, away: null } } },
    { id: 99003, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d2}T13:00:00Z`, venue: 'Huye Stadium', homeTeam: { id: 904, name: 'Mukura VS', shortName: 'Mukura VS' }, awayTeam: { id: 906, name: 'AS Kigali', shortName: 'AS Kigali' }, score: { fullTime: { home: null, away: null } } },
    { id: 99004, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d2}T13:00:00Z`, venue: 'Umuganda Stadium', homeTeam: { id: 908, name: 'Etincelles FC', shortName: 'Etincelles' }, awayTeam: { id: 907, name: 'Gasogi United', shortName: 'Gasogi Utd' }, score: { fullTime: { home: null, away: null } } },
  ];
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');

    if (code === 'RW1') {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: RWANDA_TABLE }] });
      if (type === 'scorers') return res.status(200).json({ scorers: [{ player: { name: 'Victor Mbaoma' }, team: { shortName: 'APR FC' }, goals: 7, assists: 2 }, { player: { name: 'Charles Baale' }, team: { shortName: 'Rayon Sports' }, goals: 6, assists: 3 }] });
      return res.status(200).json({ matches: getRwandaMatches() });
    }

    let apiUrl = '';
    if (type === 'competitions') apiUrl = `https://${host}/v4/competitions`;
    else if (type === 'comp_matches' && code) apiUrl = `https://${host}/v4/competitions/${code}/matches`;
    else if (type === 'standings' && code) apiUrl = `https://${host}/v4/competitions/${code}/standings`;
    else if (type === 'scorers' && code) apiUrl = `https://${host}/v4/competitions/${code}/scorers?limit=15`;
    else if (type === 'h2h' && id) apiUrl = `https://${host}/v4/matches/${id}/head2head?limit=6`;
    else if (type === 'detail' && id) apiUrl = `https://${host}/v4/matches/${id}`;
    else {
      const now = new Date();
      const dateFrom = new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10);
      const dateTo = new Date(now.getTime() + 8 * 86400000).toISOString().slice(0, 10);
      apiUrl = `https://${host}/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    const response = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } });
    const data = await response.json();

    if (type === 'competitions' && Array.isArray(data.competitions)) {
      data.competitions = [RWANDA_LEAGUE, ...data.competitions];
    } else if (!type && Array.isArray(data.matches)) {
      data.matches = [...getRwandaMatches(), ...data.matches];
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
