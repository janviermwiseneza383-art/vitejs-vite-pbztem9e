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
      { id: 99101, competition: RW_LEAGUE, status: 'TIMED', utcDate: '2026-11-27T13:00:00Z', venue: 'Amahoro Stadium', homeTeam: { id: 901, name: 'APR FC', shortName: 'APR FC' }, awayTeam: { id: 903, name: 'Police FC', shortName: 'Police' }, score: { fullTime: { home: null, away: null } } },
      { id: 99102, competition: RW_LEAGUE, status: 'TIMED', utcDate: '2026-11-28T13:00:00Z', venue: 'Kigali Pelé Stadium', homeTeam: { id: 902, name: 'Rayon Sports', shortName: 'Rayon Sports' }, awayTeam: { id: 912, name: 'Gicumbi FC', shortName: 'Gicumbi' }, score: { fullTime: { home: null, away: null } } },
    ],
  };
}

async function getUnlimitedEspnMatches() {
  const leagues = ['eng.1', 'esp.1', 'ita.1', 'ger.1', 'fra.1', 'uefa.champions', 'uefa.europa', 'eng.2', 'bra.1', 'usa.1', 'por.1', 'ned.1', 'tur.1'];
  try {
    const res = await Promise.all(leagues.map((lg) => fetch(h(`://espn.com{lg}/scoreboard`)).then((r) => r.json()).catch(() => ({ events: [] }))));
    return res.flatMap((d) => {
      const lgName = d?.leagues?.at(0)?.name || 'Football';
      return (Array.isArray(d?.events) ? d.events : []).map((ev) => {
        const comp = ev.competitions?.at(0);
        const home = comp?.competitors?.find((c) => c.homeAway === 'home');
        const away = comp?.competitors?.find((c) => c.homeAway === 'away');
        const st = ev.status?.type?.state;
        return {
          id: Number(ev.id) || Math.floor(Math.random() * 900000),
          competition: { name: lgName, code: 'ESPN' },
          status: st === 'in' ? 'IN_PLAY' : st === 'post' ? 'FINISHED' : 'TIMED',
          minute: ev.status?.displayClock || 'LIVE',
          utcDate: ev.date || new Date().toISOString(),
          venue: comp?.venue?.fullName || 'Stadium',
          homeTeam: { id: Number(home?.team?.id) || 1, name: home?.team?.displayName || 'Home', shortName: home?.team?.shortDisplayName || home?.team?.name || 'Home', crest: home?.team?.logo || '' },
          awayTeam: { id: Number(away?.team?.id) || 2, name: away?.team?.displayName || 'Away', shortName: away?.team?.shortDisplayName || away?.team?.name || 'Away', crest: away?.team?.logo || '' },
          score: { fullTime: { home: st === 'pre' ? null : Number(home?.score ?? 0), away: st === 'pre' ? null : Number(away?.score ?? 0) } },
        };
      });
    });
  } catch { return []; }
}

export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    const fdHdr = { 'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55' };
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=120');

    if (code === 'RW1') { const rw = getRwandaData(); return res.status(200).json(type === 'standings' ? { standings: [{ table: rw.table }] } : { matches: rw.matches }); }
    const from10 = new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10);
    const to7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    let apiUrl = h(`${host}/v4/matches?dateFrom=${from10}&dateTo=${to7}`);
    if (type === 'comp_matches' && code) apiUrl = h(`${host}/v4/competitions/${code}/matches?dateFrom=${from10}&dateTo=${to7}`);
    else if (type === 'standings' && code) apiUrl = h(`${host}/v4/competitions/${code}/standings`);
    else if (type === 'h2h' && id) apiUrl = h(`${host}/v4/matches/${id}/head2head?limit=6`);
    else if (type === 'detail' && id) apiUrl = h(`${host}/v4/matches/${id}`);

    const [fdRes, espnMatches] = await Promise.all([
      fetch(apiUrl, { headers: fdHdr }).then((r) => r.json()).catch(() => ({})),
      !type ? getUnlimitedEspnMatches() : Promise.resolve([]),
    ]);

    if (!type) {
      const baseMatches = Array.isArray(fdRes?.matches) ? fdRes.matches : [];
      return res.status(200).json({ matches: sortLiveScore([...espnMatches, ...getRwandaData().matches, ...baseMatches]) });
    }
    return res.status(200).json(fdRes);
  } catch (e) { return res.status(200).json({ matches: getRwandaData().matches }); }
}
