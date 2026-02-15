import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const ownerDailySummary = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_org_lastMessageAt", (q) => q.eq("orgId", args.orgId))
      .filter((q) => q.gte(q.field("lastMessageAt"), since))
      .collect();
    const messages = await ctx.db.query("messages").collect();
    const recentMessages = messages.filter((m) => m.orgId === args.orgId && m.createdAt >= since);

    return {
      conversations24h: conversations.length,
      messages24h: recentMessages.length,
      avgLatencyMs: 0,
    };
  },
});

export const sendDailyOwnerReport = action({
  args: { orgId: v.id("organizations"), ownerEmail: v.string() },
  handler: async (ctx, args) => {
    const summary = await ctx.runQuery(api.reports.ownerDailySummary, { orgId: args.orgId });
    console.log("[daily-report] owner summary", { ...summary, ownerEmail: args.ownerEmail });
    return summary;
  },
});
