# Better High 2026 — Reception Check-In System

A complete check-in app for the Better High 2026 event with QR scan, manual entry, and **NFC wristband support**.

---

## Features

✅ **Guest QR Scan** — Camera-based scanning for guest invitation QR codes
✅ **NFC Wristband Detection** — Automatic band lookup when iPhone taps a pre-written NFC wristband
✅ **Manual Entry Fallback** — Type IDs manually when camera is unavailable
✅ **Duplicate Check-In Prevention** — Already checked-in guests are blocked
✅ **Already-Assigned Band Guard** — Bands linked to other guests are flagged
✅ **PWA Support** — Installable to home screen for full-screen native-like experience
✅ **Atomic Updates** — Both Invitees and Bands tables update together

---

## File Structure

```
final-app/
├── index.html              ← Main application (HTML/CSS/JS in one file)
├── manifest.json           ← PWA manifest for home screen installation
├── vercel.json             ← Vercel deployment configuration
├── package.json            ← Node config
├── lib/
│   └── html5-qrcode.min.js ← Bundled QR scanner library
└── api/                    ← Vercel serverless functions
    ├── guest.js            ← Guest lookup endpoint
    ├── band.js             ← Wristband lookup endpoint
    └── checkin.js          ← Check-in action endpoint
```

---

## NFC Wristband Flow Explained

This is the key feature for the event. Here's how it works:

### Pre-Event: Programming the NFC Wristbands

Use **NFC Tools** (free iOS app) to write a unique URL to each NTAG213 wristband:

```
https://your-app.vercel.app/?band=BAND001
https://your-app.vercel.app/?band=BAND002
...
https://your-app.vercel.app/?band=BAND200
```

Each wristband stores its unique URL with the band ID as a query parameter.

### Event Day: How It Works

**Scenario 1 — Reception Check-In (Most Common):**

1. Hostess opens the app
2. Hostess scans guest's QR code (or types QR ID manually)
3. Guest record appears with all details
4. Hostess taps "SCAN WRISTBAND QR" button (or enters band ID manually)
5. Confirmation screen appears
6. Hostess taps "CONFIRM AND CHECK IN"
7. Both Airtable tables update instantly

**Scenario 2 — NFC Tap Flow (Alternative):**

1. Hostess opens the app and looks up guest first
2. Guest record displayed
3. Hostess taps the wristband against the iPhone (NFC contact)
4. iPhone shows a banner with the URL
5. Hostess taps the banner → the app opens (or refreshes) with `?band=BAND001` in the URL
6. App **automatically detects** the band ID from the URL
7. Band is **automatically looked up** and confirmation screen appears
8. Hostess taps "CONFIRM AND CHECK IN"

**Scenario 3 — NFC First Flow:**

1. Hostess taps wristband first (before scanning guest)
2. App opens with band ID in URL — shows a gold banner "Wristband Detected: BAND001"
3. Band ID is held in memory
4. Hostess then scans the guest QR
5. As soon as guest record is found, the held band is **automatically applied**
6. Confirmation screen appears directly
7. Hostess taps "CONFIRM AND CHECK IN"

---

## Critical: Make the App Open in the App, Not Safari

To ensure NFC taps open YOUR app (not Safari with a separate tab), install the app as a PWA:

### On iPhone (Hostess Devices):

1. Open your Vercel URL in Safari: `https://your-app.vercel.app`
2. Tap the **Share button** (square with arrow) at the bottom
3. Scroll down and tap **"Add to Home Screen"**
4. Name it: `BH 2026`
5. Tap **Add**

Now an icon appears on the home screen. When opened from the home screen icon, the app runs in **standalone mode** (no Safari URL bar).

### After Installing:

- NFC taps will open the app from the home screen (not Safari)
- The app behaves like a native iOS app
- URL parameter `?band=XXX` is still automatically detected
- The app stays in the same view — no jumping to Safari

---

## Deployment Instructions

### Step 1: Push to GitHub

1. Go to https://github.com/new
2. Repository name: `bh2026-final`
3. Public, no README
4. Create

Then upload files:
1. Click "uploading an existing file"
2. Open the `final-app` folder on your computer
3. Go INSIDE the folder
4. Press Ctrl+A to select all files
5. Drag into GitHub upload area
6. Commit message: `Initial deployment`
7. Commit

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your `bh2026-final` repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (or `/final-app` if nested)
   - **Build Command:** *(leave empty)*
   - **Output Directory:** *(leave empty)*
6. Add Environment Variables (see below)
7. Click **"Deploy"**

### Step 3: Environment Variables

In Vercel project → **Settings** → **Environment Variables**:

| Variable Name | Value | Notes |
|---|---|---|
| `AIRTABLE_TOKEN` | `pat...` | **Mark as Sensitive!** |
| `AIRTABLE_BASE_ID` | `app...` | Your Airtable base ID |
| `INVITEES_TABLE` | `Invitees` | Exact table name |
| `BANDS_TABLE` | `Bands` | Exact table name |

After adding, go to **Deployments** → **⋯** → **Redeploy** to apply.

---

## Airtable Schema Requirements

### Invitees Table

Required fields (exact names, case-sensitive):

| Field Name | Type | Notes |
|---|---|---|
| `QR CODE ID` | Single line text | Primary field — this is in the QR |
| `FIRST NAME` | Single line text | |
| `LAST NAME` | Single line text | |
| `EMAIL ADDRESS` | Email | |
| `PHONE NUMBER` | Phone | |
| `Status` | Single Select | Options: `Pending`, `Approved`, `Checked-in`, `No-Show` |
| `Linked Band` | Link to another record | Links to Bands table |
| `Arrival time` | Date with time | Auto-populated on check-in |
| `INVITED BY?` | Single line text | |
| `SPECIAL REQUESTS` | Long text | |

### Bands Table

Required fields:

| Field Name | Type | Notes |
|---|---|---|
| `Band ID` | Single line text | Primary field, format: `BAND001` |
| `Status` | Single Select | Options: `Available`, `Assigned` |
| `Linked Invitee` | Link to another record | Links to Invitees table |
| `Assigned At` | Date with time | Auto-populated on assignment |
| `Guest Name` | Lookup | From Linked Invitee → FIRST NAME |

**Pre-populate 200 records:** BAND001 through BAND200, all with Status = Available.

---

## QR Code Generation

Each guest's QR code must contain **only the QR CODE ID value** (no URL, no JSON).

### Example QR URL (for Make.com or QuickChart):

```
https://quickchart.io/qr?text={{QR_CODE_ID}}&size=400&margin=4&ecLevel=H&format=png
```

Replace `{{QR_CODE_ID}}` with the Airtable QR CODE ID field value.

### Example for BAND QR Stickers:

```
https://quickchart.io/qr?text=BAND001&size=200&margin=2&ecLevel=H&format=png
```

---

## Airtable Token Setup

1. Go to https://airtable.com/create/tokens
2. Click **"Create new token"**
3. Name: `BH 2026 Vercel App`
4. **Scopes** (all three required):
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
5. **Access:** Add your Better High 2026 base
6. Click **"Create token"**
7. **Copy the token immediately** (it won't be shown again)
8. Paste into Vercel as `AIRTABLE_TOKEN` (mark as Sensitive)

---

## Testing the App

### Test 1: Manual Guest Lookup
- Open app URL
- Enter QR ID: `0V66O46`
- Click "LOOKUP GUEST"
- Guest record should appear

### Test 2: Manual Band Assignment
- After guest is found
- Enter band ID: `BAND001`
- Click "LOOKUP BAND"
- Confirmation screen should appear
- Click "CONFIRM AND CHECK IN"
- Success screen appears
- Verify in Airtable that both tables updated

### Test 3: NFC URL Simulation
- Open URL: `https://your-app.vercel.app/?band=BAND001`
- Gold banner should appear: "Wristband Detected: BAND001"
- Look up a guest
- Confirmation screen should appear automatically with BAND001 linked

### Test 4: QR Scan
- Generate a QR for `0V66O46` (use QuickChart link above)
- Tap "OPEN QR SCANNER" in the app
- Scan the QR
- Guest record should appear

### Test 5: Already Checked-In Guard
- Check in a guest successfully
- Look them up again
- Warning should appear: "This guest has already been checked in."

### Test 6: Already Assigned Band Guard
- After successful check-in
- Try to assign the same band to another guest
- Error should appear: "This wristband is already assigned to [guest name]."

---

## Common Issues & Fixes

| Problem | Cause | Fix |
|---|---|---|
| Camera doesn't open | Not HTTPS, or permission denied | Use Vercel HTTPS URL, allow camera in browser settings |
| "QR library failed to load" | CDN blocked | Library is bundled locally — verify `/lib/html5-qrcode.min.js` deployed |
| "Authentication required" (401) | Invalid Airtable token | Regenerate token with proper scopes and base access |
| "No guest found" | QR ID doesn't match Airtable | Check field name `QR CODE ID` and exact value match |
| NFC banner opens Safari instead of app | App not installed as PWA | Add to Home Screen first, then NFC will open the installed app |
| 502 Bad Gateway | Environment variables not set or function error | Verify all 4 env vars in Vercel, redeploy |

---

## Event Day Checklist

- [ ] All 200 Band records pre-populated in Airtable (BAND001–BAND200, Status: Available)
- [ ] All guest invitations have a unique QR CODE ID
- [ ] QR codes generated and sent to guests via email
- [ ] 200 NTAG213 wristbands written with NFC Tools app (each with `?band=BANDxxx` URL)
- [ ] QR stickers printed for each band (for fallback)
- [ ] All hostess iPhones (XS or newer) have the app added to home screen
- [ ] Auto-Lock disabled on hostess phones
- [ ] Wi-Fi/cellular connectivity confirmed at reception
- [ ] Test full flow with 5 dummy guests before doors open
- [ ] Reconciliation process defined for any check-in failures
