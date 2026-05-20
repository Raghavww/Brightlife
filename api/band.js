// /api/band.js — Vercel Serverless Function
// GET /api/band?bandId=BANDXXX
// Looks up a wristband in the Airtable Bands table by Band ID

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { bandId } = req.query;
  if (!bandId) {
    return res.status(400).json({ error: 'Missing required parameter: bandId' });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, BANDS_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !BANDS_TABLE) {
    return res.status(500).json({
      error: 'Server configuration error: Airtable environment variables are not set.'
    });
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
      let errorMessage = `Airtable API returned status ${response.status}`;
      if (response.status === 401) errorMessage = 'Airtable authentication failed. The access token may be invalid or expired.';
      else if (response.status === 403) errorMessage = 'Airtable permission denied. The token does not have access to this base.';
      else if (response.status === 404) errorMessage = 'Bands table not found. Please verify the table name in environment variables.';
      else if (response.status === 422) errorMessage = 'Airtable validation error. Please check that the "Band ID" field exists in the Bands table.';
      return res.status(502).json({ error: errorMessage, detail: text });
    }

    const data = await response.json();
    const band = data.records && data.records.length > 0 ? data.records[0] : null;
    return res.status(200).json({ band });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error: ' + err.message });
  }
}
