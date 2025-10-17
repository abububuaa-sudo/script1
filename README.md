# script1 — Connected + Auth

This build adds user registration/login and JWT auth on top of the connected version.

## How it works
- Use “Auth” button to open the modal and **Sign up** or **Log in**.
- Token is stored in `localStorage` and sent as `Authorization: Bearer` header.
- AI endpoints (`/api/match`, `/api/align-cv`, `/api/cover-letter`) require login.
- Jobs list (`/api/jobs`) is public.

## Setup
1. Upload files to your GitHub Pages repo folder `script1/`.
2. Set API base:
   - Open with `?api=https://your-backend.com`
   - or click “Set API” in the UI (saves to localStorage)
   - default: `https://atlas-backend.onrender.com`

## Security note
This is a demo auth suitable for MVP. For production, move to a real DB and enable HTTPS only, rate limits, and stronger validation.
