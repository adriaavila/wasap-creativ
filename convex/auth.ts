import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";

async function getIdentity(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

export async function requireOrg(ctx: QueryCtx | MutationCtx | ActionCtx) {
  const identity = await getIdentity(ctx);
  const membership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
    .first();

  if (!membership) {
    throw new Error("No organization membership found");
  }

  return { orgId: membership.orgId, userId: identity.tokenIdentifier, role: membership.role };
}
