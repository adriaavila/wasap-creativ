import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOrg } from "./auth";

export const listKnowledgeDocs = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const docs = await ctx.db.query("knowledgeDocs").withIndex("by_org", (q) => q.eq("orgId", orgId)).collect();
    if (!args.search) return docs;
    const search = args.search.toLowerCase();
    return docs.filter((d) => d.title.toLowerCase().includes(search) || d.body.toLowerCase().includes(search));
  },
});

export const createKnowledgeDoc = mutation({
  args: { title: v.string(), body: v.string(), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    return ctx.db.insert("knowledgeDocs", { ...args, orgId, updatedAt: Date.now() });
  },
});

export const updateKnowledgeDoc = mutation({
  args: { docId: v.id("knowledgeDocs"), title: v.string(), body: v.string(), tags: v.array(v.string()) },
  handler: async (ctx, { docId, ...args }) => {
    const { orgId } = await requireOrg(ctx);
    const doc = await ctx.db.get(docId);
    if (!doc || doc.orgId !== orgId) throw new Error("Not found");
    await ctx.db.patch(docId, { ...args, updatedAt: Date.now() });
  },
});

export const deleteKnowledgeDoc = mutation({
  args: { docId: v.id("knowledgeDocs") },
  handler: async (ctx, args) => {
    const { orgId } = await requireOrg(ctx);
    const doc = await ctx.db.get(args.docId);
    if (!doc || doc.orgId !== orgId) throw new Error("Not found");
    await ctx.db.delete(args.docId);
  },
});
