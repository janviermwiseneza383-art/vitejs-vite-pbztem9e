const h = (u) => ['https', '//' + u].join(':');
const RW_LEAGUE = { id: 9999, name: 'Rwanda Premier League', code: 'RW1' };
const UEL_LEAGUE = { id: 9998, name: 'UEFA Europa League', code: 'UEL' };

async function fetchEspnRwanda() {
  try {
    const r = await fetch(h('://espn.com'));
    if (!r.ok) return [];
    const d = await r.json();
    if (!Array.isArray(d?.events) || d.events.length === 0) return [];
    return d.events.map((ev) => {
      const comp = ev.competitions?.at(0);
      const home = comp?.competitors?.find((c) => c.homeAway === 'home');
      const away = comp?.competitors?.find((c) => c.homeAway === 'away');
      const state = ev.status?.type?.state;
      return {
        id: Number(ev.id) || Math.floor(Math.random() * 100000),
        competition: RW_LEAGUE,
        status: state === 'in' ? 'IN_PLAY' : state === 'post' ? 'FINISHED' : 'TIMED',
        minute: ev.status?.displayClock,
        utcDate: ev.date,
        venue: comp?.venue?.fullName || 'Rwanda',
        homeTeam: { id: Number(home?.team?.id) || 901, name: home?.team?.displayName, shortName: home?.team?.shortDisplayName || home?.team?.displayName, crest: home?.team?.logo || '' },
        awayTeam: { id: Number(away?.team?.id) || 902, name: away?.team?.displayName, shortName: away?.team?.shortDisplayName || away?.team?.displayName, crest: away?.team?.logo || '' },
        score: { fullTime: { home: state === 'pre' ? null : Number(home?.score ?? 0), away: state === 'pre' ? null : Number(away?.score ?? 0) } },
      };
    });
  } catch {
    return [];
  }
}

async function fetchSportsDbRwanda() {
  try {
    const [pastRes, nextRes, tblRes] = await Promise.all([
      fetch(h('://thesportsdb.com')).then((r) => r.json()).catch(() => ({})),
      fetch(h('://thesportsdb.com')).then((r) => r.json()).catch(() => ({})),
      fetch(h('://thesportsdb.com')).then((r) => r.json()).catch(() => ({})),
    ]);
    const mapEv = (ev) => {
      const done = ev.intHomeScore !== null && ev.intHomeScore !== undefined && ev.intHomeScore !== '';
      return {
        id: Number(ev.idEvent) || Math.floor(Math.random() * 100000),
        competition: RW_LEAGUE,
        status: done ? 'FINISHED' : 'TIMED',
        utcDate: `${ev.dateEvent || new Date().toISOString().slice(0, 10)}T${(ev.strTime || '13:00:00').slice(0, 8)}Z`,
        venue: ev.strVenue || 'Kigali Pelé Stadium',
        homeTeam: { id: Number(ev.idHomeTeam) || 901, name: ev.strHomeTeam, shortName: ev.strHomeTeam, crest: ev.strHomeTeamBadge || '' },
        awayTeam: { id: Number(ev.idAwayTeam) || 902, name: ev.strAwayTeam, shortName: ev.strAwayTeam, crest: ev.strAwayTeamBadge || '' },
        score: { fullTime: { home: done ? Number(ev.intHomeScore) : null, away: done ? Number(ev.intAwayScore) : null } },
      };
    };
    const past = Array.isArray(pastRes?.events) ? pastRes.events.slice(0, 8).map(mapEv) : [];
    const next = Array.isArray(nextRes?.events) ? nextRes.events.slice(0, 8).map(mapEv) : [];
    const table = Array.isArray(tblRes?.table)
      ? tblRes.table.map((r, i) => ({
          position: Number(r.intRank) || i + 1,
          team: { id: Number(r.idTeam) || i, name: r.strTeam, shortName: r.strTeam, crest: r.strTeamBadge || '' },
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

async function getRwandaData() {
  const [espnMatches, sdb] = await Promise.all([fetchEspnRwanda(), fetchSportsDbRwanda()]);
  const matches = espnMatches.length > 0 ? espnMatches : sdb.matches;
  return { matches, table: sdb.table };
}

function getUelData() {
  const base = h('crests.football-data.org/');
  const teams = [
    { id: 66, name: 'Manchester United', shortName: 'Man United', crest: `${base}66.png` },
    { id: 73, name: 'Tottenham Hotspur', shortName: 'Tottenham', crest: `${base}73.png` },
    { id: 100, name: 'AS Roma', shortName: 'Roma', crest: `${base}100.png` },
    { id: 77, name: 'Athletic Club', shortName: 'Athletic', crest: `${base}77.png` },
  ];
  const d = new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10);
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
    if (code === 'RW1') {
      const rw = await getRwandaData();
      return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches });
    }
    if (code === 'UEL') {
      const uel = getUelData();
      return res.status(200).json(type === 'standings' ? { standings: [{ table: uel.table }] } : { matches: uel.matches });
    }

    let apiUrl = '';
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);
    else {
      const now = new Date();
      apiUrl = h(`${host}/v4/matches?dateFrom=${new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10)}&dateTo=${new Date(now.getTime() + 8 * 86400000).toISOString().slice(0, 10)}`);
    }

    const data = await fetch(apiUrl, { headers: { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' } }).then((r) => r.json());
    if (!type && Array.isArray(data.matches)) {
      const rw = await getRwandaData();
      data.matches = [...rw.matches, ...getUelData().matches, ...data.matches];
    }
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
