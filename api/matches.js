export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    let apiUrl = '';

    if (type === 'competitions') {
      apiUrl = `https://${host}/v4/competitions`;
    } else if (type === 'comp_matches' && code) {
      apiUrl = `https://${host}/v4/competitions/${code}/matches`;
    } else if (type === 'standings' && code) {
      apiUrl = `https://${host}/v4/competitions/${code}/standings`;
    } else if (type === 'scorers' && code) {
      apiUrl = `https://${host}/v4/competitions/${code}/scorers?limit=20`;
    } else if (type === 'teams' && code) {
      apiUrl = `https://${host}/v4/competitions/${code}/teams`;
    } else if (type === 'h2h' && id) {
      apiUrl = `https://${host}/v4/matches/${id}/head2head?limit=10`;
    } else if (type === 'detail' && id) {
      apiUrl = `https://${host}/v4/matches/${id}`;
    } else {
      const now = new Date();
      const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      const future = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
      const dateFrom = past.toISOString().slice(0, 10);
      const dateTo = future.toISOString().slice(0, 10);
      apiUrl = `https://${host}/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55',
      },
    });

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
