// /api/guest.js — Vercel Serverless Function
// GET /api/guest?qrId=XXXXXX
// Looks up a guest in the Airtable Invitees table by QR CODE ID

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { qrId } = req.query;
  if (!qrId) {
    return res.status(400).json({ error: 'Missing required parameter: qrId' });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, INVITEES_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !INVITEES_TABLE) {
    return res.status(500).json({
      error: 'Server configuration error: Airtable environment variables are not set.'
    });
  }

  try {
    const formula = encodeURIComponent(`{QR CODE ID}='${qrId.replace(/'/g, "\\'")}'`);
    const tableName = encodeURIComponent(INVITEES_TABLE);
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
      else if (response.status === 404) errorMessage = 'Airtable table not found. Please verify the table name and base ID.';
      else if (response.status === 422) errorMessage = 'Airtable validation error. Please check field names and formula syntax.';
      return res.status(502).json({ error: errorMessage, detail: text });
    }

    const data = await response.json();
    const guest = data.records && data.records.length > 0 ? data.records[0] : null;
    return res.status(200).json({ guest });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error: ' + err.message });
  }
}
