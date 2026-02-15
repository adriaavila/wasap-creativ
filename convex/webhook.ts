import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";

export const resolveDefaultAgent = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const active = await ctx.db
      .query("agents")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    return active?._id ?? null;
  },
});

export const upsertConversationFromWebhook = internalMutation({
  args: { orgId: v.id("organizations"), phone: v.string(), agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const now = Date.now();
    let contact = await ctx.db
      .query("contacts")
      .withIndex("by_org_phone", (q) => q.eq("orgId", args.orgId).eq("phoneNumber", args.phone))
      .first();

    if (!contact) {
      const id = await ctx.db.insert("contacts", { orgId: args.orgId, phoneNumber: args.phone, createdAt: now, updatedAt: now });
      contact = await ctx.db.get(id);
    }
    if (!contact) throw new Error("Contact create failed");

    let conversation = await ctx.db
      .query("conversations")
      .withIndex("by_org_contact", (q) => q.eq("orgId", args.orgId).eq("contactId", contact._id))
      .first();

    if (!conversation) {
      const id = await ctx.db.insert("conversations", {
        orgId: args.orgId,
        contactId: contact._id,
        agentId: args.agentId,
        lastMessageAt: now,
        unreadCount: 0,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });
      conversation = await ctx.db.get(id);
    }
    if (!conversation) throw new Error("Conversation create failed");
    return conversation._id;
  },
});

export const insertInboundMessage = internalMutation({
  args: { orgId: v.id("organizations"), conversationId: v.id("conversations"), content: v.string(), providerMessageId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("messages", {
      orgId: args.orgId,
      conversationId: args.conversationId,
      role: "user",
      content: args.content,
      providerMessageId: args.providerMessageId,
      direction: "inbound",
      sendStatus: "received",
      createdAt: now,
    });
    await ctx.db.patch(args.conversationId, { unreadCount: 1, lastMessageAt: now, updatedAt: now });
  },
});

export const insertAssistantMessage = internalMutation({
  args: { orgId: v.id("organizations"), conversationId: v.id("conversations"), content: v.string(), sendStatus: v.union(v.literal("generated"), v.literal("sent"), v.literal("failed")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("messages", {
      orgId: args.orgId,
      conversationId: args.conversationId,
      role: "assistant",
      content: args.content,
      direction: "outbound",
      sendStatus: args.sendStatus,
      createdAt: now,
    });
    await ctx.db.patch(args.conversationId, { lastMessageAt: now, updatedAt: now });
  },
});

export const sendWhatsAppMessage = action({
  args: { to: v.string(), body: v.string() },
  handler: async (_ctx, args) => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) throw new Error("WhatsApp credentials not configured");
    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to: args.to, text: { body: args.body } }),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`WhatsApp send failed ${response.status}: ${text}`);
    }
    return text;
  },
});
