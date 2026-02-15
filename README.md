# AI WhatsApp Agents (Next.js + Convex)

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables from `.env.local.example` into `.env.local`.
3. Start Convex dev backend and codegen: `npx convex dev`
4. Start Next.js: `npm run dev`

## WhatsApp webhook verification
- Configure Meta webhook URL: `https://<your-domain>/api/webhook`
- Verify token must match `WHATSAPP_VERIFY_TOKEN`.
- `GET /api/webhook` returns `hub.challenge` when token and mode match.

## Local dev + tunnel
- Run app locally and expose with tunnel (ngrok / cloudflared) for Meta callbacks.
- Update webhook URL in Meta app dashboard.

## Deployment (Vercel)
- Deploy Next.js to Vercel.
- Deploy Convex with `npx convex deploy`.
- Set environment variables in Vercel project settings and Convex dashboard.

## Notes
- Webhook signature validation uses `X-Hub-Signature-256` and `WHATSAPP_APP_SECRET`.
- `AGENT_PROMPT.md` is loaded at runtime for the assistant system prompt.
- All Convex functions enforce org scoping via memberships.
