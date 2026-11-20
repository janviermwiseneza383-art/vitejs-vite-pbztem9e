const h = (u) => ['https', '//' + u].join(':');
const RW_LEAGUE = { id: 9999, name: 'Rwanda Premier League', code: 'RW1' };
const UEL_LEAGUE = { id: 9998, name: 'UEFA Europa League', code: 'UEL' };

let rwLeagueIdCache = null;

async function findRwandaLeagueId() {
  if (rwLeagueIdCache) return rwLeagueIdCache;
  try {
    const r = await fetch(h('://thesportsdb.com'));
    const d = await r.json();
    const found = (d?.leagues || []).find(
      (l) => l.strSport === 'Soccer' && /rwanda/i.test(l.strLeague || '')
    );
    rwLeagueIdCache = found?.idLeague || '4726';
  } catch {
    rwLeagueIdCache = '4726';
  }
  return rwLeagueIdCache;
}

function mapSportsDbEvent(ev) {
  const done = ev.intHomeScore !== null && ev.intHomeScore !== undefined && ev.intHomeScore !== '';
  const dateStr = ev.dateEvent || new Date().toISOString().slice(0, 10);
  const timeStr = (ev.strTime || '13:00:00').slice(0, 8);
  return {
    id: Number(ev.idEvent) || Math.floor(Math.random() * 100000),
    competition: RW_LEAGUE,
    status: done ? 'FINISHED' : 'TIMED',
    utcDate: `${dateStr}T${timeStr}Z`,
    venue: ev.strVenue || 'Kigali Pelé Stadium',
    homeTeam: {
      id: Number(ev.idHomeTeam) || 901,
      name: ev.strHomeTeam,
      shortName: ev.strHomeTeam,
      crest: ev.strHomeTeamBadge || '',
    },
    awayTeam: {
      id: Number(ev.idAwayTeam) || 902,
      name: ev.strAwayTeam,
      shortName: ev.strAwayTeam,
      crest: ev.strAwayTeamBadge || '',
    },
    score: {
      fullTime: {
        home: done ? Number(ev.intHomeScore) : null,
        away: done ? Number(ev.intAwayScore) : null,
      },
    },
  };
}

async function getLiveRwandaData() {
  try {
    const lid = await findRwandaLeagueId();
    const [pastRes, nextRes, tblRes] = await Promise.all([
      fetch(h(`://thesportsdb.com{lid}`)).then((r) => r.json()).catch(() => ({})),
      fetch(h(`://thesportsdb.com{lid}`)).then((r) => r.json()).catch(() => ({})),
      fetch(h(`://thesportsdb.com{lid}`)).then((r) => r.json()).catch(() => ({})),
    ]);
    const past = Array.isArray(pastRes?.events) ? pastRes.events.slice(0, 8).map(mapSportsDbEvent) : [];
    const next = Array.isArray(nextRes?.events) ? nextRes.events.slice(0, 8).map(mapSportsDbEvent) : [];
    const table = Array.isArray(tblRes?.table)
      ? tblRes.table.map((r, idx) => ({
          position: Number(r.intRank) || idx + 1,
          team: { id: Number(r.idTeam) || idx, name: r.strTeam, shortName: r.strTeam, crest: r.strTeamBadge || '' },
          playedGames: Number(r.intPlayed) || 0,
          goalDifference: Number(r.intGoalDifference) || 0,
          points: Number(r.intPoints) || 0,
        }))
      : [];
    return { matches: [...next, ...past], table };
  } catch {
    return { matches: [], table: [] };
  }
}

function getUelData() {
  const base = h('crests.football-data.org/');
  const teams = [
    { id: 66, name: 'Manchester United', shortName: 'Man United', crest: `${base}66.png` },
    { id: 73, name: 'Tottenham Hotspur', shortName: 'Tottenham', crest: `${base}73.png` },
    { id: 100, name: 'AS Roma', shortName: 'Roma', crest: `${base}100.png` },
    { id: 77, name: 'Athletic Club', shortName: 'Athletic', crest: `${base}77.png` },
    { id: 19, name: 'Eintracht Frankfurt', shortName: 'Frankfurt', crest: `${base}19.png` },
    { id: 110, name: 'SS Lazio', shortName: 'Lazio', crest: `${base}110.png` },
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
      const rw = await getLiveRwandaData();
      if (type === 'standings') return res.status(200).json({ standings: [{ table: rw.table }] });
      return res.status(200).json({ matches: rw.matches });
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
      const rw = await getLiveRwandaData();
      data.matches = [...rw.matches, ...getUelData().matches, ...data.matches];
    }

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
