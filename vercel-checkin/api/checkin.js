// /api/checkin.js — Vercel Serverless Function
// POST /api/checkin  body: { guestId, bandId }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { guestId, bandId } = req.body || {};

  if (!guestId || !bandId) {
    return res.status(400).json({ success: false, error: 'Missing guestId or bandId' });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, INVITEES_TABLE, BANDS_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !INVITEES_TABLE || !BANDS_TABLE) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  const now = new Date().toISOString();
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Update Invitee
    const r1 = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(INVITEES_TABLE)}/${guestId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fields: {
            'Linked Band': [bandId],
            'Status': 'Checked-in',
            'Arrival time': now
          },
          typecast: true
        })
      }
    );
    if (!r1.ok) {
      const t = await r1.text();
      return res.status(502).json({ success: false, error: `Invitee update failed: ${t}` });
    }

    // 2. Update Band
    const r2 = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(BANDS_TABLE)}/${bandId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fields: {
            'Status': 'Assigned',
            'Assigned At': now
          },
          typecast: true
        })
      }
    );
    if (!r2.ok) {
      const t = await r2.text();
      return res.status(502).json({ success: false, error: `Band update failed: ${t}` });
    }

    return res.status(200).json({ success: true, timestamp: now });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
