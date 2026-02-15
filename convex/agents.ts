import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrg } from "./auth";

export const listAgents = query({
  args: {},
  handler: async (ctx) => {
    const { orgId } = await requireOrg(ctx);
    return ctx.db.query("agents").withIndex("by_org", (q) => q.eq("orgId", orgId)).collect();
  },
});

export const createAgent = mutation({
  args: {
    name: v.string(),
    systemPromptMode: v.union(v.literal("file"), v.literal("stored")),
    systemPromptStored: v.optional(v.string()),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
  },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const now = Date.now();
    return ctx.db.insert("agents", { ...args, orgId, isActive: false, createdAt: now, updatedAt: now });
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.string(),
    systemPromptMode: v.union(v.literal("file"), v.literal("stored")),
    systemPromptStored: v.optional(v.string()),
    model: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, { agentId, ...patch }) => {
    const { orgId } = await requireOrg(ctx);
    const existing = await ctx.db.get(agentId);
    if (!existing || existing.orgId !== orgId) throw new Error("Not found");
    await ctx.db.patch(agentId, { ...patch, updatedAt: Date.now() });
  },
});

export const setActiveAgent = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const agents = await ctx.db.query("agents").withIndex("by_org", (q) => q.eq("orgId", orgId)).collect();
    for (const agent of agents) {
      await ctx.db.patch(agent._id, { isActive: agent._id === args.agentId, updatedAt: Date.now() });
    }
  },
});
