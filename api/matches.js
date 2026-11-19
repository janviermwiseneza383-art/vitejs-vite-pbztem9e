export default async function handler(req, res) {
  try {
    const { type, id, code } = req.query || {};
    const host = ['api', 'football-data', 'org'].join('.');
    let apiUrl = '';

    if (type === 'standings' && code) {
      apiUrl = `https://${host}/v4/competitions/${code}/standings`;
    } else if (type === 'h2h' && id) {
      apiUrl = `https://${host}/v4/matches/${id}/head2head?limit=6`;
    } else if (type === 'detail' && id) {
      apiUrl = `https://${host}/v4/matches/${id}`;
    } else {
      const now = new Date();
      const future = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
      const dateFrom = now.toISOString().slice(0, 10);
      const dateTo = future.toISOString().slice(0, 10);
      apiUrl = `https://${host}/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55',
      },
    });

    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
