// /api/checkin.js — Vercel Serverless Function
// POST /api/checkin   body: { guestId, bandId }
// Updates both Invitees and Bands records atomically

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const { guestId, bandId } = req.body || {};

  if (!guestId || !bandId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: guestId and bandId are both required.'
    });
  }

  const { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, INVITEES_TABLE, BANDS_TABLE } = process.env;

  if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !INVITEES_TABLE || !BANDS_TABLE) {
    return res.status(500).json({
      success: false,
      error: 'Server configuration error: Airtable environment variables are not set.'
    });
  }

  const now = new Date().toISOString();
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // STEP 1: Update Invitee — set Linked Band, Status, Arrival time
    const inviteeResponse = await fetch(
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

    if (!inviteeResponse.ok) {
      const text = await inviteeResponse.text();
      return res.status(502).json({
        success: false,
        error: 'Failed to update the guest record in Airtable.',
        detail: text
      });
    }

    // STEP 2: Update Band — set Status, Assigned At
    const bandResponse = await fetch(
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

    if (!bandResponse.ok) {
      const text = await bandResponse.text();
      return res.status(502).json({
        success: false,
        error: 'Guest was checked in, but the wristband status could not be updated. Please reconcile manually in Airtable.',
        detail: text
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: now,
      guestId,
      bandId
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Unexpected server error during check-in: ' + err.message
    });
  }
}
