import { ConvexError } from "convex/values";
import type { GenericQueryCtx, GenericMutationCtx, GenericDataModel } from "convex/server";

export const getCurrentUser =  async <T extends GenericDataModel>(ctx: GenericQueryCtx<T> | GenericMutationCtx<T>) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new ConvexError("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_token",
      // @ts-expect-error Type Checker cannot get to the final type, which is the same as provided
      (q) => q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
  if (!user) {
    throw new ConvexError("Unauthenticated call");
  }
  return user;
};
