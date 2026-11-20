const h = (u) => ['https', '//' + u].join(':');

const RWANDA_LEAGUE = {
  id: 9999,
  name: 'Rwanda Premier League',
  code: 'RW1',
  emblem: h('upload.wikimedia.org/wikipedia/en/thumb/3/36/Rwanda_Premier_League_logo.png/200px-Rwanda_Premier_League_logo.png'),
};

const UEL_LEAGUE = {
  id: 9998,
  name: 'UEFA Europa League',
  code: 'UEL',
  emblem: h('upload.wikimedia.org/wikipedia/en/thumb/0/03/Europa_League_2021.svg/200px-Europa_League_2021.svg.png'),
};

const RW_TEAMS = {
  apr: { id: 901, name: 'APR FC', shortName: 'APR FC', crest: h('upload.wikimedia.org/wikipedia/en/thumb/8/87/APR_FC_logo.png/150px-APR_FC_logo.png') },
  ray: { id: 902, name: 'Rayon Sports FC', shortName: 'Rayon Sports', crest: h('upload.wikimedia.org/wikipedia/en/thumb/2/26/Rayon_Sports_FC_logo.png/150px-Rayon_Sports_FC_logo.png') },
  pol: { id: 903, name: 'Police FC Rwanda', shortName: 'Police FC', crest: h('upload.wikimedia.org/wikipedia/en/thumb/a/a2/Police_FC_%28Rwanda%29_logo.png/150px-Police_FC_%28Rwanda%29_logo.png') },
  muk: { id: 904, name: 'Mukura VS', shortName: 'Mukura VS', crest: h('upload.wikimedia.org/wikipedia/en/thumb/f/f6/Mukura_Victory_Sports_FC_logo.png/150px-Mukura_Victory_Sports_FC_logo.png') },
  kiy: { id: 905, name: 'SC Kiyovu', shortName: 'Kiyovu Sports', crest: h('upload.wikimedia.org/wikipedia/en/thumb/5/59/SC_Kiyovu_Sports_logo.png/150px-SC_Kiyovu_Sports_logo.png') },
  ask: { id: 906, name: 'AS Kigali', shortName: 'AS Kigali', crest: h('upload.wikimedia.org/wikipedia/en/thumb/c/c8/AS_Kigali_logo.png/150px-AS_Kigali_logo.png') },
  gas: { id: 907, name: 'Gasogi United', shortName: 'Gasogi Utd', crest: h('upload.wikimedia.org/wikipedia/en/thumb/0/05/Gasogi_United_FC_logo.png/150px-Gasogi_United_FC_logo.png') },
  eti: { id: 908, name: 'Etincelles FC', shortName: 'Etincelles', crest: h('upload.wikimedia.org/wikipedia/en/thumb/3/39/Etincelles_FC_logo.png/150px-Etincelles_FC_logo.png') },
};

const RWANDA_TABLE = [
  { position: 1, team: RW_TEAMS.apr, playedGames: 10, won: 8, draw: 2, lost: 0, goalDifference: 14, points: 26 },
  { position: 2, team: RW_TEAMS.ray, playedGames: 10, won: 7, draw: 2, lost: 1, goalDifference: 11, points: 23 },
  { position: 3, team: RW_TEAMS.pol, playedGames: 10, won: 6, draw: 2, lost: 2, goalDifference: 7, points: 20 },
  { position: 4, team: RW_TEAMS.muk, playedGames: 10, won: 5, draw: 3, lost: 2, goalDifference: 5, points: 18 },
  { position: 5, team: RW_TEAMS.kiy, playedGames: 10, won: 4, draw: 3, lost: 3, goalDifference: 2, points: 15 },
  { position: 6, team: RW_TEAMS.ask, playedGames: 10, won: 4, draw: 2, lost: 4, goalDifference: 0, points: 14 },
  { position: 7, team: RW_TEAMS.gas, playedGames: 10, won: 3, draw: 3, lost: 4, goalDifference: -2, points: 12 },
  { position: 8, team: RW_TEAMS.eti, playedGames: 10, won: 2, draw: 2, lost: 6, goalDifference: -8, points: 8 },
];

function getRwandaMatches() {
  const d1 = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const d2 = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  return [
    { id: 99001, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d1}T13:00:00Z`, venue: 'Kigali Pelé Stadium', homeTeam: RW_TEAMS.apr, awayTeam: RW_TEAMS.pol, score: { fullTime: { home: null, away: null } } },
    { id: 99002, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d1}T16:00:00Z`, venue: 'Amahoro National Stadium', homeTeam: RW_TEAMS.ray, awayTeam: RW_TEAMS.kiy, score: { fullTime: { home: null, away: null } } },
    { id: 99003, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d2}T13:00:00Z`, venue: 'Huye Stadium', homeTeam: RW_TEAMS.muk, awayTeam: RW_TEAMS.ask, score: { fullTime: { home: null, away: null } } },
    { id: 99004, competition: RWANDA_LEAGUE, status: 'TIMED', utcDate: `${d2}T13:00:00Z`, venue: 'Umuganda Stadium', homeTeam: RW_TEAMS.eti, awayTeam: RW_TEAMS.gas, score: { fullTime: { home: null, away: null } } },
  ];
}

function getUelData() {
  const teams = [
    { id: 66, name: 'Manchester United', shortName: 'Man United', crest: h('crests.football-data.org/66.png') },
    { id: 73, name: 'Tottenham Hotspur', shortName: 'Tottenham', crest: h('crests.football-data.org/73.png') },
    { id: 100, name: 'AS Roma', shortName: 'Roma', crest: h('crests.football-data.org/100.png') },
    { id: 77, name: 'Athletic Club', shortName: 'Athletic', crest: h('crests.football-data.org/77.png') },
    { id: 19, name: 'Eintracht Frankfurt', shortName: 'Frankfurt', crest: h('crests.football-data.org/19.png') },
    { id: 110, name: 'SS Lazio', shortName: 'Lazio', crest: h('crests.football-data.org/110.png') },
  ];
  const d = new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10);
  return {
    table: teams.map((tm, i) => ({ position: i + 1, team: tm, playedGames: 4, goalDifference: 6 - i, points: 12 - i * 2 })),
    matches: [
      { id: 88001, competition: UEL_LEAGUE, status: 'TIMED', utcDate: `${d}T20:00:00Z`, venue: 'Old Trafford', homeTeam: teams.at(0), awayTeam: teams.at(2), score: { fullTime: { home: null, away: null } } },
      { id: 88002, competition: UEL_LEAGUE, status: 'TIMED', utcDate: `${d}T20:00:00Z`, venue: 'Tottenham Hotspur Stadium', homeTeam: teams.at(1), awayTeam: teams.at(4), score: { fullTime: { home: null, away: null } } },
      { id: 88003, competition: UEL_LEAGUE, status: 'TIMED', utcDate: `${d}T20:00:00Z`, venue: 'San Mamés', homeTeam: teams.at(3), awayTeam: teams.at(5), score: { fullTime: { home: null, away: null } } },
    ],
  };
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');

    if (code === 'RW1') {
      if (type === 'standings') return res.status(200).json({ standings: [{ table: RWANDA_TABLE }] });
      return res.status(200).json({ matches: getRwandaMatches() });
    }

    if (code === 'UEL') {
      const uel = getUelData();
      if (type === 'standings') return res.status(200).json({ standings: [{ table: uel.table }] });
      return res.status(200).json({ matches: uel.matches });
    }

    let apiUrl = '';
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    else {
      const now = new Date();
      const dateFrom = new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10);
      const dateTo = new Date(now.getTime() + 8 * 86400000).toISOString().slice(0, 10);
      apiUrl = h(`${host}/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`);
    }

    const response = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } });
    const data = await response.json();

    if (!type && Array.isArray(data.matches)) {
      data.matches = [...getRwandaMatches(), ...getUelData().matches, ...data.matches];
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
