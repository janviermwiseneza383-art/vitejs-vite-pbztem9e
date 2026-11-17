export default async function handler(req, res) {
  try {
    const { dateFrom, dateTo } = req.query || {};
    const apiUrl =
      dateFrom && dateTo
        ? `https://football-data.org{dateFrom}&dateTo=${dateTo}`
        : 'https://football-data.org';

    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55',
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
