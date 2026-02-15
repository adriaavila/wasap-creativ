/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericActionCtx, GenericMutationCtx, GenericQueryCtx } from "convex/server";

export type QueryCtx = GenericQueryCtx<any>;
export type MutationCtx = GenericMutationCtx<any>;
export type ActionCtx = GenericActionCtx<any>;

export { query, mutation, action, internalMutation } from "convex/server";
