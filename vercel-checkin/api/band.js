// /api/band.js — Vercel Serverless Function
// GET /api/band?bandId=BANDXXX

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bandId } = req.query;
  if (!bandId) return res.status(400).json({ error: 'Missing bandId' });

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, BANDS_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !BANDS_TABLE) {
    return res.status(500).json({ error: 'Server misconfigured - env vars missing' });
  }

  try {
    const formula = encodeURIComponent(`{Band ID}='${bandId.replace(/'/g, "\\'")}'`);
    const tableName = encodeURIComponent(BANDS_TABLE);
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?filterByFormula=${formula}&maxRecords=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: `Airtable ${response.status}: ${text}` });
    }

    const data = await response.json();
    const band = data.records && data.records.length > 0 ? data.records[0] : null;
    return res.status(200).json({ band });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
