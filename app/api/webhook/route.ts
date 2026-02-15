import { readFile } from "node:fs/promises";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import { webhookPayloadSchema } from "@/lib/validators";
import { generateAssistantReply } from "@/lib/openai";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL ?? "");

function verifySignature(rawBody: string, signature: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) {
    console.warn("[webhook] WHATSAPP_APP_SECRET missing. Skipping signature validation.");
    return true;
  }
  if (!signature) return false;

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

async function processIncoming(requestId: string, payloadRaw: string) {
  const parsed = webhookPayloadSchema.safeParse(JSON.parse(payloadRaw));
  if (!parsed.success) {
    console.error("[webhook] Invalid payload", { requestId, issues: parsed.error.issues });
    return;
  }

  const firstMessage = parsed.data.entry[0]?.changes[0]?.value.messages?.[0];
  const firstContact = parsed.data.entry[0]?.changes[0]?.value.contacts?.[0];
  if (!firstMessage || firstMessage.type !== "text" || !firstMessage.text?.body) return;

  const waId = firstContact?.wa_id ?? firstMessage.from;
  const messageText = firstMessage.text.body;
  const providerMessageId = firstMessage.id;
  const timestamp = firstMessage.timestamp;

  const orgId = process.env.DEFAULT_ORG_ID;
  if (!orgId) {
    console.error("[webhook] Missing DEFAULT_ORG_ID", { requestId, waId, providerMessageId, timestamp });
    return;
  }

  try {
    const agentId = await convex.query(api.webhook.resolveDefaultAgent, { orgId: orgId as never });
    if (!agentId) throw new Error("No active agent configured");

    const conversationId = await convex.mutation(api.webhook.upsertConversationFromWebhook, { orgId: orgId as never, phone: waId, agentId });

    await convex.mutation(api.webhook.insertInboundMessage, {
      orgId: orgId as never,
      conversationId,
      content: messageText,
      providerMessageId,
    });

    const filePrompt = await readFile("AGENT_PROMPT.md", "utf-8");
    const answer = await generateAssistantReply({
      systemPrompt: `${filePrompt}\n\nOrg Policy: Always be concise and safe.`,
      userMessage: messageText,
    });

    await convex.mutation(api.webhook.insertAssistantMessage, { orgId: orgId as never, conversationId, content: answer, sendStatus: "generated" });

    await convex.action(api.webhook.sendWhatsAppMessage, { to: waId, body: answer });
    await convex.mutation(api.webhook.insertAssistantMessage, { orgId: orgId as never, conversationId, content: answer, sendStatus: "sent" });
  } catch (error) {
    console.error("[webhook] processing error", {
      requestId,
      phone: waId,
      messageId: providerMessageId,
      orgId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function GET(request: NextRequest) {
  console.log("[webhook] GET verification hit");
  const search = request.nextUrl.searchParams;
  const mode = search.get("hub.mode");
  const verifyToken = search.get("hub.verify_token");
  const challenge = search.get("hub.challenge");

  if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  console.log("[webhook] POST incoming hit");
  const raw = await request.text();
  const signature = request.headers.get("X-Hub-Signature-256");
  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const requestId = randomUUID();
  void processIncoming(requestId, raw);
  return NextResponse.json({ ok: true }, { status: 200 });
}
