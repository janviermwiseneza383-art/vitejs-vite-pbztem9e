export default async function handler(req, res) {
  try {
    const response = await fetch('https://football-data.org', {
      headers: {
        'X-Auth-Token': 'dcc25e0d94964ac1a382090daf4dbc55',
      },
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}
