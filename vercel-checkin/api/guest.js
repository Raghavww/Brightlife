// /api/guest.js — Vercel Serverless Function
// GET /api/guest?qrId=XXXXXX

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { qrId } = req.query;
  if (!qrId) return res.status(400).json({ error: 'Missing qrId' });

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, INVITEES_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !INVITEES_TABLE) {
    return res.status(500).json({ error: 'Server misconfigured - env vars missing' });
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
      return res.status(502).json({ error: `Airtable ${response.status}: ${text}` });
    }

    const data = await response.json();
    const guest = data.records && data.records.length > 0 ? data.records[0] : null;
    return res.status(200).json({ guest });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
