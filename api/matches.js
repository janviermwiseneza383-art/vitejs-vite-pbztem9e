export default async function handler(req, res) {
  try {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 9);

    const dateFrom = start.toISOString().split('T')[0];
    const dateTo = end.toISOString().split('T')[0];

    const apiUrl = `https://football-data.org{dateFrom}&dateTo=${dateTo}`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55',
      },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
