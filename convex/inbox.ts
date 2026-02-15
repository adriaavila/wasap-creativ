import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireOrg } from "./auth";

export const listConversations = query({
  args: {
    filters: v.optional(v.object({ status: v.optional(v.union(v.literal("open"), v.literal("pending"), v.literal("closed"))) })),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_org_lastMessageAt", (q) => q.eq("orgId", orgId))
      .order("desc")
      .take(100);

    const filtered = [] as Array<(typeof conversations)[number] & { contactName: string }>;
    for (const conversation of conversations) {
      if (args.filters?.status && conversation.status !== args.filters.status) continue;
      const contact = await ctx.db.get(conversation.contactId);
      if (!contact) continue;
      const contactName = contact.displayName ?? contact.phoneNumber;
      if (args.search && !contactName.toLowerCase().includes(args.search.toLowerCase())) continue;
      filtered.push({ ...conversation, contactName });
    }
    return filtered;
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.orgId !== orgId) throw new Error("Not found");
    return conversation;
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations"), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.orgId !== orgId) throw new Error("Not found");

    return ctx.db
      .query("messages")
      .withIndex("by_org_conversation_createdAt", (q) => q.eq("orgId", orgId).eq("conversationId", args.conversationId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const sendOperatorMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const now = Date.now();
    await ctx.db.insert("messages", {
      orgId,
      conversationId: args.conversationId,
      role: "operator",
      content: args.content,
      direction: "outbound",
      sendStatus: "generated",
      createdAt: now,
    });
    await ctx.db.patch(args.conversationId, { lastMessageAt: now, updatedAt: now });
  },
});

export const markConversationRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.orgId !== orgId) throw new Error("Not found");
    await ctx.db.patch(args.conversationId, { unreadCount: 0, updatedAt: Date.now() });
  },
});

export const setConversationStatus = mutation({
  args: { conversationId: v.id("conversations"), status: v.union(v.literal("open"), v.literal("pending"), v.literal("closed")) },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.orgId !== orgId) throw new Error("Not found");
    await ctx.db.patch(args.conversationId, { status: args.status, updatedAt: Date.now() });
  },
});

export const addLabel = mutation({
  args: { conversationId: v.id("conversations"), labelId: v.id("labels") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const existing = await ctx.db
      .query("conversationLabels")
      .withIndex("by_org_conversation_label", (q) => q.eq("orgId", orgId).eq("conversationId", args.conversationId).eq("labelId", args.labelId))
      .first();
    if (!existing) {
      await ctx.db.insert("conversationLabels", { orgId, ...args });
    }
  },
});

export const removeLabel = mutation({
  args: { conversationId: v.id("conversations"), labelId: v.id("labels") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const existing = await ctx.db
      .query("conversationLabels")
      .withIndex("by_org_conversation_label", (q) => q.eq("orgId", orgId).eq("conversationId", args.conversationId).eq("labelId", args.labelId))
      .first();
    if (existing) await ctx.db.delete(existing._id);
  },
});

export const addNote = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    const { orgId, userId } = await requireOrg(ctx);
    await ctx.db.insert("notes", { orgId, conversationId: args.conversationId, content: args.content, authorUserId: userId, createdAt: Date.now() });
  },
});
