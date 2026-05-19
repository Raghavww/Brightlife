# Better High 2026 — Vercel Check-In App

Vercel pe deploy karne wala version. **GitHub + Vercel** ka combination — Cloudflare se aasaan!

## File Structure

```
vercel-checkin/
├── index.html              ← main app (frontend)
├── package.json            ← Node config
├── vercel.json             ← Vercel config
├── lib/
│   └── html5-qrcode.min.js
└── api/                    ← Vercel functions (no /functions/ folder!)
    ├── guest.js
    ├── band.js
    └── checkin.js
```

⚠️ **Important Difference From Cloudflare:**
- Cloudflare: `functions/api/*.js`
- Vercel: `api/*.js` (sirf `/api/` folder, no `functions/`)

## Deployment Method — GitHub + Vercel (Sabse Aasaan)

### Step 1: GitHub Repository Banao

1. https://github.com/new kholo
2. Repository name: `bh2026-vercel` (ya jo bhi)
3. **Public** select karo
4. README/gitignore add mat karo
5. **Create repository**

### Step 2: Files Upload Karo GitHub Pe

1. **"uploading an existing file"** link click karo
2. **Computer pe `vercel-checkin` folder kholo**
3. **Folder ke ANDAR jao** (sab files dikhne chahiye)
4. **Ctrl + A** dabao (sab select)
5. **Drag and drop** karo GitHub upload area me
6. Verify hone do — yeh dikhna chahiye:
   - ✓ index.html
   - ✓ vercel.json
   - ✓ package.json
   - ✓ api/guest.js
   - ✓ api/band.js
   - ✓ api/checkin.js
   - ✓ lib/html5-qrcode.min.js
7. Commit message: `Initial upload`
8. **Commit changes**

### Step 3: Vercel Pe Deploy Karo

1. https://vercel.com kholo
2. **Sign Up / Login** karo (GitHub se signup recommended)
3. **"Add New..."** → **"Project"** click karo
4. **GitHub se repository import karo:**
   - "Import Git Repository" me apna `bh2026-vercel` dhundo
   - **"Import"** click karo
5. **Configure Project screen:**
   - **Project Name:** kuch bhi (default ok)
   - **Framework Preset:** **Other** select karo (NOT Next.js)
   - **Root Directory:** `./` (default rakho)
   - **Build Command:** *(blank rakho)*
   - **Output Directory:** *(blank rakho)*
   - **Install Command:** *(blank rakho)*
6. **Environment Variables** expand karo aur add karo:

| Name | Value |
|---|---|
| `AIRTABLE_TOKEN` | aapka token (pat...) |
| `AIRTABLE_BASE_ID` | aapka base ID (app...) |
| `INVITEES_TABLE` | `Invitees` |
| `BANDS_TABLE` | `Bands` |

7. **"Deploy"** click karo

### Step 4: Wait For Deploy

~30 seconds me deploy ho jayega. URL milegi kuch aisi:

```
https://bh2026-vercel.vercel.app
```

### Step 5: Test Karo

1. URL kholo
2. Manual entry me `0V66O46` daalo
3. **LOOKUP MANUALLY** dabao
4. Selima Bennour ka card dikhna chahiye ✅

## Airtable Setup (Same As Before)

Token banao: https://airtable.com/create/tokens

Scopes:
- `data.records:read`
- `data.records:write`
- `schema.bases:read`

Access: Better High 2026 base

## Vercel Advantages

✅ **Folder structure issue nahi** — Vercel auto-detects `/api/`
✅ **Sirf 1 click deploy** GitHub se
✅ **Environment variables UI me directly**
✅ **Free tier — 100GB bandwidth**
✅ **Custom domain support**
✅ **Automatic HTTPS**
✅ **Push to GitHub → auto-redeploy**

## Troubleshooting

**"Function not found"** → API folder structure check karo: `api/` honi chahiye, `functions/api/` nahi

**"Server misconfigured"** → Environment variables add nahi hue. Vercel dashboard → Project → Settings → Environment Variables

**"No guest found"** → QR ID match nahi ho raha. Airtable me exact value check karo

**Camera nahi khulti** → HTTPS chahiye (Vercel automatic deta hai, koi issue nahi hona chahiye)
